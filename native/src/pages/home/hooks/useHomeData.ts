import { useState, useEffect, useCallback } from 'react';
import {
  bannerService,
  PromotionBanner,
  categoryService,
  Category,
  homepageIconService,
  HomepageCategoryIcon,
  serviceService,
  Service,
  propertyService,
  Property,
  projectService,
  Project,
  workerService,
  Worker,
  vendorService,
  Vendor,
} from '../../../services';
import { cache, CACHE_TTL, CACHE_KEYS } from '../../../utils/cache';
import { useSubscriptionStatus } from '../../../hooks/useSubscriptionStatus';

export type SectionType =
  | 'properties'
  | 'fixedPriceServices'
  | 'projects'
  | 'homeServices'
  | 'workers'
  | 'vendors'
  | 'properties2BHK'
  | 'properties3BHK'
  | 'propertiesUnder10K'
  | 'constructionServices'
  | 'inquiryServices';

interface HomeData {
  // Banners
  banners: PromotionBanner[];
  isLoadingBanners: boolean;

  // Categories
  categories: Category[];
  isLoadingCategories: boolean;
  homepageIcons: HomepageCategoryIcon[];
  isLoadingIcons: boolean;

  // Services
  popularServices: Service[];
  isLoadingServices: boolean;
  homeServices: Service[];
  isLoadingHomeServices: boolean;
  constructionServices: Service[];
  isLoadingConstructionServices: boolean;
  fixedPriceServices: Service[];
  isLoadingFixedPriceServices: boolean;
  inquiryServices: Service[];
  isLoadingInquiryServices: boolean;

  // Properties
  properties: Property[];
  isLoadingProperties: boolean;
  properties2BHK: Property[];
  isLoadingProperties2BHK: boolean;
  properties3BHK: Property[];
  isLoadingProperties3BHK: boolean;
  propertiesUnder10K: Property[];
  isLoadingPropertiesUnder10K: boolean;

  // Projects
  projects: Project[];
  isLoadingProjects: boolean;

  // Workers
  topWorkers: Worker[];
  isLoadingWorkers: boolean;

  // Vendors
  topVendors: Vendor[];
  isLoadingVendors: boolean;

  // Subscription
  hasActiveSubscription: boolean;

  // Lazy loading
  loadSection: (section: SectionType) => void;
  loadedSections: Set<SectionType>;

  // Refresh function
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

export function useHomeData(isAuthenticated: boolean): HomeData {
  // Get subscription status from Redux
  const { hasActiveSubscription } = useSubscriptionStatus();

  // Banners
  const [banners, setBanners] = useState<PromotionBanner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [homepageIcons, setHomepageIcons] = useState<HomepageCategoryIcon[]>([]);
  const [isLoadingIcons, setIsLoadingIcons] = useState(true);

  // Services
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [homeServices, setHomeServices] = useState<Service[]>([]);
  const [isLoadingHomeServices, setIsLoadingHomeServices] = useState(true);
  const [constructionServices, setConstructionServices] = useState<Service[]>([]);
  const [isLoadingConstructionServices, setIsLoadingConstructionServices] = useState(true);
  const [fixedPriceServices, setFixedPriceServices] = useState<Service[]>([]);
  const [isLoadingFixedPriceServices, setIsLoadingFixedPriceServices] = useState(true);
  const [inquiryServices, setInquiryServices] = useState<Service[]>([]);
  const [isLoadingInquiryServices, setIsLoadingInquiryServices] = useState(true);

  // Properties
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [properties2BHK, setProperties2BHK] = useState<Property[]>([]);
  const [isLoadingProperties2BHK, setIsLoadingProperties2BHK] = useState(true);
  const [properties3BHK, setProperties3BHK] = useState<Property[]>([]);
  const [isLoadingProperties3BHK, setIsLoadingProperties3BHK] = useState(true);
  const [propertiesUnder10K, setPropertiesUnder10K] = useState<Property[]>([]);
  const [isLoadingPropertiesUnder10K, setIsLoadingPropertiesUnder10K] = useState(true);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Workers
  const [topWorkers, setTopWorkers] = useState<Worker[]>([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true);

  // Vendors
  const [topVendors, setTopVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Track which sections have been loaded
  const [loadedSections, setLoadedSections] = useState<Set<SectionType>>(new Set());

  // Load functions with caching (stale-while-revalidate pattern)
  const loadBanners = useCallback(
    async (forceRefresh = false) => {
      try {
        // Check cache first (without showing loading if we have cache)
        if (!forceRefresh) {
          const cached = await cache.get<PromotionBanner[]>(CACHE_KEYS.BANNERS);
          if (cached) {
            setBanners(cached);
            // Don't show loading since we have cached data
          } else {
            // No cache, show loading
            setIsLoadingBanners(true);
          }
        } else {
          // Force refresh, show loading
          setIsLoadingBanners(true);
        }

        const promotionBanners = await bannerService.getPromotionBanners();
        setBanners(promotionBanners);
        await cache.set(CACHE_KEYS.BANNERS, promotionBanners, { ttl: CACHE_TTL.BANNERS });
      } catch (error) {
        // Error handling
        if (banners.length === 0) {
          setBanners([]);
        }
      } finally {
        setIsLoadingBanners(false);
      }
    },
    [banners.length]
  );

  const loadCategories = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cached = await cache.get<Category[]>(CACHE_KEYS.CATEGORIES);
          if (cached) {
            setCategories(cached);
          } else {
            setIsLoadingCategories(true);
          }
        } else {
          setIsLoadingCategories(true);
        }

        const rootCategories = await categoryService.getRootCategories(true);
        setCategories(rootCategories);
        await cache.set(CACHE_KEYS.CATEGORIES, rootCategories, { ttl: CACHE_TTL.CATEGORIES });
      } catch (error) {
        // Error handling
        if (categories.length === 0) {
          setCategories([]);
        }
      } finally {
        setIsLoadingCategories(false);
      }
    },
    [categories.length]
  );

  const loadHomepageIcons = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cached = await cache.get<HomepageCategoryIcon[]>(CACHE_KEYS.HOMEPAGE_ICONS);
          if (cached) {
            setHomepageIcons(cached);
          } else {
            setIsLoadingIcons(true);
          }
        } else {
          setIsLoadingIcons(true);
        }

        const icons = await homepageIconService.getActiveIcons();
        setHomepageIcons(icons);
        await cache.set(CACHE_KEYS.HOMEPAGE_ICONS, icons, { ttl: CACHE_TTL.HOMEPAGE_ICONS });
      } catch (error) {
        // Error handling
        if (homepageIcons.length === 0) {
          setHomepageIcons([]);
        }
      } finally {
        setIsLoadingIcons(false);
      }
    },
    [homepageIcons.length]
  );

  const loadPopularServices = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cached = await cache.get<Service[]>(CACHE_KEYS.POPULAR_SERVICES);
          if (cached) {
            setPopularServices(cached);
          } else {
            setIsLoadingServices(true);
          }
        } else {
          setIsLoadingServices(true);
        }

        const services = await serviceService.getPopularServices();
        setPopularServices(services);
        await cache.set(CACHE_KEYS.POPULAR_SERVICES, services, { ttl: CACHE_TTL.POPULAR_SERVICES });
      } catch (error) {
        // Error handling
        if (popularServices.length === 0) {
          setPopularServices([]);
        }
      } finally {
        setIsLoadingServices(false);
      }
    },
    [popularServices.length]
  );

  const loadProperties = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cached = await cache.get<Property[]>(CACHE_KEYS.PROPERTIES);
          if (cached) {
            setProperties(cached);
            setIsLoadingProperties(false);
            return; // Use cache, skip fetch
          } else {
            setIsLoadingProperties(true);
          }
        } else {
          setIsLoadingProperties(true);
        }

        const response = await propertyService.getAllProperties(1, 20);
        if (response.data && Array.isArray(response.data)) {
          const propertiesWithImages = response.data.filter(
            (prop) => prop.images && Array.isArray(prop.images) && prop.images.length > 0
          );
          const propertiesToShow =
            propertiesWithImages.length > 0
              ? propertiesWithImages.slice(0, 10)
              : response.data.slice(0, 10);
          setProperties(propertiesToShow);
          await cache.set(CACHE_KEYS.PROPERTIES, propertiesToShow, { ttl: CACHE_TTL.PROPERTIES });
        } else {
          setProperties([]);
        }
      } catch (error) {
        // Error handling
        if (properties.length === 0) {
          setProperties([]);
        }
      } finally {
        setIsLoadingProperties(false);
      }
    },
    [properties.length]
  );

  const loadHomeServices = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cached = await cache.get<Service[]>(CACHE_KEYS.HOME_SERVICES);
          if (cached) {
            setHomeServices(cached);
            setIsLoadingHomeServices(false);
            return; // Use cache, skip fetch
          } else {
            setIsLoadingHomeServices(true);
          }
        } else {
          setIsLoadingHomeServices(true);
        }

        const services = await serviceService.getServicesByCategory('Home Services', 10);
        setHomeServices(services);
        await cache.set(CACHE_KEYS.HOME_SERVICES, services, { ttl: CACHE_TTL.SERVICES });
      } catch (error) {
        // Error handling
        if (homeServices.length === 0) {
          setHomeServices([]);
        }
      } finally {
        setIsLoadingHomeServices(false);
      }
    },
    [homeServices.length]
  );

  const loadConstructionServices = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cached = await cache.get<Service[]>(CACHE_KEYS.CONSTRUCTION_SERVICES);
          if (cached) {
            setConstructionServices(cached);
            setIsLoadingConstructionServices(false);
            return; // Use cache, skip fetch
          } else {
            setIsLoadingConstructionServices(true);
          }
        } else {
          setIsLoadingConstructionServices(true);
        }

        const services = await serviceService.getServicesByCategory('Construction Services', 10);
        setConstructionServices(services);
        await cache.set(CACHE_KEYS.CONSTRUCTION_SERVICES, services, { ttl: CACHE_TTL.SERVICES });
      } catch (error) {
        // Error handling
        if (constructionServices.length === 0) {
          setConstructionServices([]);
        }
      } finally {
        setIsLoadingConstructionServices(false);
      }
    },
    [constructionServices.length]
  );

  const loadFixedPriceServices = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cached = await cache.get<Service[]>(CACHE_KEYS.FIXED_PRICE_SERVICES);
          if (cached) {
            setFixedPriceServices(cached);
            setIsLoadingFixedPriceServices(false);
            return; // Use cache, skip fetch
          } else {
            setIsLoadingFixedPriceServices(true);
          }
        } else {
          setIsLoadingFixedPriceServices(true);
        }

        const response = await serviceService.getServicesWithFilters({
          page: 1,
          limit: 10,
          price_type: 'fixed',
        });
        if (response.data) {
          setFixedPriceServices(response.data);
          await cache.set(CACHE_KEYS.FIXED_PRICE_SERVICES, response.data, {
            ttl: CACHE_TTL.SERVICES,
          });
        } else {
          setFixedPriceServices([]);
        }
      } catch (error) {
        // Error handling
        if (fixedPriceServices.length === 0) {
          setFixedPriceServices([]);
        }
      } finally {
        setIsLoadingFixedPriceServices(false);
      }
    },
    [fixedPriceServices.length]
  );

  const loadInquiryServices = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cached = await cache.get<Service[]>(CACHE_KEYS.INQUIRY_SERVICES);
          if (cached) {
            setInquiryServices(cached);
            setIsLoadingInquiryServices(false);
            return; // Use cache, skip fetch
          } else {
            setIsLoadingInquiryServices(true);
          }
        } else {
          setIsLoadingInquiryServices(true);
        }

        const response = await serviceService.getServicesWithFilters({
          page: 1,
          limit: 10,
          price_type: 'inquiry',
        });
        if (response.data) {
          setInquiryServices(response.data);
          await cache.set(CACHE_KEYS.INQUIRY_SERVICES, response.data, { ttl: CACHE_TTL.SERVICES });
        } else {
          setInquiryServices([]);
        }
      } catch (error) {
        // Error handling
        if (inquiryServices.length === 0) {
          setInquiryServices([]);
        }
      } finally {
        setIsLoadingInquiryServices(false);
      }
    },
    [inquiryServices.length]
  );

  const loadProperties2BHK = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cached = await cache.get<Property[]>(CACHE_KEYS.PROPERTIES_2BHK);
          if (cached) {
            setProperties2BHK(cached);
            setIsLoadingProperties2BHK(false);
            return; // Use cache, skip fetch
          } else {
            setIsLoadingProperties2BHK(true);
          }
        } else {
          setIsLoadingProperties2BHK(true);
        }

        const response = await propertyService.getPropertiesWithFilters({
          page: 1,
          limit: 20,
          listing_type: 'rent',
          bedrooms: 2,
        });
        if (response.data) {
          const data = response.data.slice(0, 10);
          setProperties2BHK(data);
          await cache.set(CACHE_KEYS.PROPERTIES_2BHK, data, { ttl: CACHE_TTL.PROPERTIES });
        } else {
          setProperties2BHK([]);
        }
      } catch (error) {
        // Error handling
        if (properties2BHK.length === 0) {
          setProperties2BHK([]);
        }
      } finally {
        setIsLoadingProperties2BHK(false);
      }
    },
    [properties2BHK.length]
  );

  const loadProperties3BHK = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cached = await cache.get<Property[]>(CACHE_KEYS.PROPERTIES_3BHK);
          if (cached) {
            setProperties3BHK(cached);
            setIsLoadingProperties3BHK(false);
            return; // Use cache, skip fetch
          } else {
            setIsLoadingProperties3BHK(true);
          }
        } else {
          setIsLoadingProperties3BHK(true);
        }

        const response = await propertyService.getPropertiesWithFilters({
          page: 1,
          limit: 20,
          listing_type: 'rent',
          bedrooms: 3,
        });
        if (response.data) {
          const data = response.data.slice(0, 10);
          setProperties3BHK(data);
          await cache.set(CACHE_KEYS.PROPERTIES_3BHK, data, { ttl: CACHE_TTL.PROPERTIES });
        } else {
          setProperties3BHK([]);
        }
      } catch (error) {
        // Error handling
        if (properties3BHK.length === 0) {
          setProperties3BHK([]);
        }
      } finally {
        setIsLoadingProperties3BHK(false);
      }
    },
    [properties3BHK.length]
  );

  const loadPropertiesUnder10K = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cached = await cache.get<Property[]>(CACHE_KEYS.PROPERTIES_UNDER_10K);
          if (cached) {
            setPropertiesUnder10K(cached);
            setIsLoadingPropertiesUnder10K(false);
            return; // Use cache, skip fetch
          } else {
            setIsLoadingPropertiesUnder10K(true);
          }
        } else {
          setIsLoadingPropertiesUnder10K(true);
        }

        const response = await propertyService.getPropertiesWithFilters({
          page: 1,
          limit: 20,
          listing_type: 'rent',
          max_price: 10000,
        });
        if (response.data) {
          const data = response.data.slice(0, 10);
          setPropertiesUnder10K(data);
          await cache.set(CACHE_KEYS.PROPERTIES_UNDER_10K, data, { ttl: CACHE_TTL.PROPERTIES });
        } else {
          setPropertiesUnder10K([]);
        }
      } catch (error) {
        // Error handling
        if (propertiesUnder10K.length === 0) {
          setPropertiesUnder10K([]);
        }
      } finally {
        setIsLoadingPropertiesUnder10K(false);
      }
    },
    [propertiesUnder10K.length]
  );

  const loadProjects = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cached = await cache.get<Project[]>(CACHE_KEYS.PROJECTS);
          if (cached) {
            setProjects(cached);
            setIsLoadingProjects(false);
            return; // Use cache, skip fetch
          } else {
            setIsLoadingProjects(true);
          }
        } else {
          setIsLoadingProjects(true);
        }

        const response = await projectService.getProjectsWithFilters({
          page: 1,
          limit: 10,
        });

        if (response.success && response.data) {
          setProjects(response.data.projects);
          await cache.set(CACHE_KEYS.PROJECTS, response.data.projects, { ttl: CACHE_TTL.PROJECTS });
        } else {
          setProjects([]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '';
        if (projects.length === 0) {
          setProjects([]);
        }
      } finally {
        setIsLoadingProjects(false);
      }
    },
    [projects.length]
  );

  const loadTopWorkers = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cached = await cache.get<Worker[]>(CACHE_KEYS.TOP_WORKERS);
          if (cached) {
            setTopWorkers(cached);
            setIsLoadingWorkers(false);
            return; // Use cache, skip fetch
          } else {
            setIsLoadingWorkers(true);
          }
        } else {
          setIsLoadingWorkers(true);
        }

        const response = await workerService.getWorkersWithFilters({
          page: 1,
          limit: 10,
          is_active: true,
          sortBy: 'rating',
          sortOrder: 'desc',
        });

        if (response.success && response.data) {
          setTopWorkers(response.data.workers);
          await cache.set(CACHE_KEYS.TOP_WORKERS, response.data.workers, {
            ttl: CACHE_TTL.WORKERS,
          });
        } else {
          setTopWorkers([]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '';
        if (topWorkers.length === 0) {
          setTopWorkers([]);
        }
      } finally {
        setIsLoadingWorkers(false);
      }
    },
    [topWorkers.length]
  );

  const loadTopVendors = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!forceRefresh) {
          const cached = await cache.get<Vendor[]>(CACHE_KEYS.TOP_VENDORS);
          if (cached) {
            setTopVendors(cached);
            setIsLoadingVendors(false);
            return; // Use cache, skip fetch
          } else {
            setIsLoadingVendors(true);
          }
        } else {
          setIsLoadingVendors(true);
        }

        const response = await vendorService.getVendorsWithFilters({
          page: 1,
          limit: 10,
        });

        if (response.success && response.data) {
          setTopVendors(response.data.vendors);
          await cache.set(CACHE_KEYS.TOP_VENDORS, response.data.vendors, {
            ttl: CACHE_TTL.VENDORS,
          });
        } else {
          setTopVendors([]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '';
        if (topVendors.length === 0) {
          setTopVendors([]);
        }
      } finally {
        setIsLoadingVendors(false);
      }
    },
    [topVendors.length]
  );

  // Lazy load section function
  const loadSection = useCallback(
    (section: SectionType) => {
      // Don't load if already loaded
      if (loadedSections.has(section)) {
        return;
      }

      // Mark section as loaded
      setLoadedSections((prev) => new Set(prev).add(section));

      // Load the appropriate section
      switch (section) {
        case 'properties':
          loadProperties();
          break;
        case 'fixedPriceServices':
          loadFixedPriceServices();
          break;
        case 'projects':
          if (isAuthenticated) {
            loadProjects();
          }
          break;
        case 'homeServices':
          loadHomeServices();
          break;
        case 'workers':
          loadTopWorkers();
          break;
        case 'vendors':
          loadTopVendors();
          break;
        case 'properties2BHK':
          loadProperties2BHK();
          break;
        case 'properties3BHK':
          loadProperties3BHK();
          break;
        case 'propertiesUnder10K':
          loadPropertiesUnder10K();
          break;
        case 'constructionServices':
          loadConstructionServices();
          break;
        case 'inquiryServices':
          loadInquiryServices();
          break;
      }
    },
    [
      loadedSections,
      isAuthenticated,
      loadProperties,
      loadFixedPriceServices,
      loadProjects,
      loadHomeServices,
      loadTopWorkers,
      loadTopVendors,
      loadProperties2BHK,
      loadProperties3BHK,
      loadPropertiesUnder10K,
      loadConstructionServices,
      loadInquiryServices,
    ]
  );

  // Refresh function to reload visible/loaded sections only
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Always refresh above-the-fold content
      const refreshPromises = [
        loadBanners(true),
        loadCategories(true),
        loadHomepageIcons(true),
        loadPopularServices(true),
      ];

      // Refresh only sections that have been loaded
      const sectionsToRefresh: SectionType[] = Array.from(loadedSections);
      sectionsToRefresh.forEach((section) => {
        switch (section) {
          case 'properties':
            refreshPromises.push(loadProperties(true));
            break;
          case 'fixedPriceServices':
            refreshPromises.push(loadFixedPriceServices(true));
            break;
          case 'projects':
            if (isAuthenticated) {
              refreshPromises.push(loadProjects(true));
            }
            break;
          case 'homeServices':
            refreshPromises.push(loadHomeServices(true));
            break;
          case 'workers':
            refreshPromises.push(loadTopWorkers(true));
            break;
          case 'vendors':
            refreshPromises.push(loadTopVendors(true));
            break;
          case 'properties2BHK':
            refreshPromises.push(loadProperties2BHK(true));
            break;
          case 'properties3BHK':
            refreshPromises.push(loadProperties3BHK(true));
            break;
          case 'propertiesUnder10K':
            refreshPromises.push(loadPropertiesUnder10K(true));
            break;
          case 'constructionServices':
            refreshPromises.push(loadConstructionServices(true));
            break;
          case 'inquiryServices':
            refreshPromises.push(loadInquiryServices(true));
            break;
        }
      });

      await Promise.all(refreshPromises);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    loadedSections,
    isAuthenticated,
    loadBanners,
    loadCategories,
    loadHomepageIcons,
    loadPopularServices,
    loadProperties,
    loadHomeServices,
    loadConstructionServices,
    loadFixedPriceServices,
    loadInquiryServices,
    loadProperties2BHK,
    loadProperties3BHK,
    loadPropertiesUnder10K,
    loadProjects,
    loadTopWorkers,
    loadTopVendors,
  ]);

  // Initial load - only load above the fold content
  useEffect(() => {
    loadBanners();
    loadCategories();
    loadHomepageIcons();
    loadPopularServices();
    // All other sections will be lazily loaded as user scrolls
  }, [loadBanners, loadCategories, loadHomepageIcons, loadPopularServices]);

  return {
    banners,
    isLoadingBanners,
    categories,
    isLoadingCategories,
    homepageIcons,
    isLoadingIcons,
    popularServices,
    isLoadingServices,
    homeServices,
    isLoadingHomeServices,
    constructionServices,
    isLoadingConstructionServices,
    fixedPriceServices,
    isLoadingFixedPriceServices,
    inquiryServices,
    isLoadingInquiryServices,
    properties,
    isLoadingProperties,
    properties2BHK,
    isLoadingProperties2BHK,
    properties3BHK,
    isLoadingProperties3BHK,
    propertiesUnder10K,
    isLoadingPropertiesUnder10K,
    projects,
    isLoadingProjects,
    topWorkers,
    isLoadingWorkers,
    topVendors,
    isLoadingVendors,
    hasActiveSubscription,
    loadSection,
    loadedSections,
    refresh,
    isRefreshing,
  };
}
