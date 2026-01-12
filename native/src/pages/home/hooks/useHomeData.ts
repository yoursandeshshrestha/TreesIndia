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

  // Refresh function
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

export function useHomeData(isAuthenticated: boolean): HomeData {
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

  // Subscription
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load functions with caching (stale-while-revalidate pattern)
  const loadBanners = useCallback(async (forceRefresh = false) => {
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
      console.error('Failed to load banners:', error);
      if (banners.length === 0) {
        setBanners([]);
      }
    } finally {
      setIsLoadingBanners(false);
    }
  }, [banners.length]);

  const loadCategories = useCallback(async (forceRefresh = false) => {
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
      console.error('Failed to load categories:', error);
      if (categories.length === 0) {
        setCategories([]);
      }
    } finally {
      setIsLoadingCategories(false);
    }
  }, [categories.length]);

  const loadHomepageIcons = useCallback(async (forceRefresh = false) => {
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
      console.error('Failed to load homepage icons:', error);
      if (homepageIcons.length === 0) {
        setHomepageIcons([]);
      }
    } finally {
      setIsLoadingIcons(false);
    }
  }, [homepageIcons.length]);

  const loadPopularServices = useCallback(async (forceRefresh = false) => {
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
      console.error('Failed to load popular services:', error);
      if (popularServices.length === 0) {
        setPopularServices([]);
      }
    } finally {
      setIsLoadingServices(false);
    }
  }, [popularServices.length]);

  const loadProperties = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await cache.get<Property[]>(CACHE_KEYS.PROPERTIES);
        if (cached) {
          setProperties(cached);
        } else {
          setIsLoadingProperties(true);
        }
      } else {
        setIsLoadingProperties(true);
      }

      const response = await propertyService.getAllProperties(1, 20);
      if (response.data && Array.isArray(response.data)) {
        const propertiesWithImages = response.data.filter(prop =>
          prop.images && Array.isArray(prop.images) && prop.images.length > 0
        );
        const propertiesToShow = propertiesWithImages.length > 0
          ? propertiesWithImages.slice(0, 10)
          : response.data.slice(0, 10);
        setProperties(propertiesToShow);
        await cache.set(CACHE_KEYS.PROPERTIES, propertiesToShow, { ttl: CACHE_TTL.PROPERTIES });
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
      if (properties.length === 0) {
        setProperties([]);
      }
    } finally {
      setIsLoadingProperties(false);
    }
  }, [properties.length]);

  const loadHomeServices = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await cache.get<Service[]>(CACHE_KEYS.HOME_SERVICES);
        if (cached) {
          setHomeServices(cached);
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
      console.error('Failed to load home services:', error);
      if (homeServices.length === 0) {
        setHomeServices([]);
      }
    } finally {
      setIsLoadingHomeServices(false);
    }
  }, [homeServices.length]);

  const loadConstructionServices = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await cache.get<Service[]>(CACHE_KEYS.CONSTRUCTION_SERVICES);
        if (cached) {
          setConstructionServices(cached);
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
      console.error('Failed to load construction services:', error);
      if (constructionServices.length === 0) {
        setConstructionServices([]);
      }
    } finally {
      setIsLoadingConstructionServices(false);
    }
  }, [constructionServices.length]);

  const loadFixedPriceServices = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await cache.get<Service[]>(CACHE_KEYS.FIXED_PRICE_SERVICES);
        if (cached) {
          setFixedPriceServices(cached);
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
        await cache.set(CACHE_KEYS.FIXED_PRICE_SERVICES, response.data, { ttl: CACHE_TTL.SERVICES });
      } else {
        setFixedPriceServices([]);
      }
    } catch (error) {
      console.error('Failed to load fixed price services:', error);
      if (fixedPriceServices.length === 0) {
        setFixedPriceServices([]);
      }
    } finally {
      setIsLoadingFixedPriceServices(false);
    }
  }, [fixedPriceServices.length]);

  const loadInquiryServices = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await cache.get<Service[]>(CACHE_KEYS.INQUIRY_SERVICES);
        if (cached) {
          setInquiryServices(cached);
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
      console.error('Failed to load inquiry services:', error);
      if (inquiryServices.length === 0) {
        setInquiryServices([]);
      }
    } finally {
      setIsLoadingInquiryServices(false);
    }
  }, [inquiryServices.length]);

  const loadProperties2BHK = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await cache.get<Property[]>(CACHE_KEYS.PROPERTIES_2BHK);
        if (cached) {
          setProperties2BHK(cached);
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
      console.error('Failed to load 2 BHK properties:', error);
      if (properties2BHK.length === 0) {
        setProperties2BHK([]);
      }
    } finally {
      setIsLoadingProperties2BHK(false);
    }
  }, [properties2BHK.length]);

  const loadProperties3BHK = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await cache.get<Property[]>(CACHE_KEYS.PROPERTIES_3BHK);
        if (cached) {
          setProperties3BHK(cached);
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
      console.error('Failed to load 3 BHK properties:', error);
      if (properties3BHK.length === 0) {
        setProperties3BHK([]);
      }
    } finally {
      setIsLoadingProperties3BHK(false);
    }
  }, [properties3BHK.length]);

  const loadPropertiesUnder10K = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await cache.get<Property[]>(CACHE_KEYS.PROPERTIES_UNDER_10K);
        if (cached) {
          setPropertiesUnder10K(cached);
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
        max_rent: 10000,
      });
      if (response.data) {
        const data = response.data.slice(0, 10);
        setPropertiesUnder10K(data);
        await cache.set(CACHE_KEYS.PROPERTIES_UNDER_10K, data, { ttl: CACHE_TTL.PROPERTIES });
      } else {
        setPropertiesUnder10K([]);
      }
    } catch (error) {
      console.error('Failed to load properties under 10K:', error);
      if (propertiesUnder10K.length === 0) {
        setPropertiesUnder10K([]);
      }
    } finally {
      setIsLoadingPropertiesUnder10K(false);
    }
  }, [propertiesUnder10K.length]);

  const loadProjects = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await cache.get<Project[]>(CACHE_KEYS.PROJECTS);
        if (cached) {
          setProjects(cached);
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
        if (response.data.user_subscription) {
          setHasActiveSubscription(
            response.data.user_subscription.has_active_subscription
          );
        }

        setProjects(response.data.projects);
        await cache.set(CACHE_KEYS.PROJECTS, response.data.projects, { ttl: CACHE_TTL.PROJECTS });
      } else {
        setProjects([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      if (!errorMessage.includes('Subscription required')) {
        console.error('Failed to load projects:', error);
      }
      if (projects.length === 0) {
        setProjects([]);
      }
    } finally {
      setIsLoadingProjects(false);
    }
  }, [projects.length]);

  const loadTopWorkers = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await cache.get<Worker[]>(CACHE_KEYS.TOP_WORKERS);
        if (cached) {
          setTopWorkers(cached);
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
        if (response.data.user_subscription) {
          setHasActiveSubscription(
            response.data.user_subscription.has_active_subscription
          );
        }

        setTopWorkers(response.data.workers);
        await cache.set(CACHE_KEYS.TOP_WORKERS, response.data.workers, { ttl: CACHE_TTL.WORKERS });
      } else {
        setTopWorkers([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      if (!errorMessage.includes('Subscription required')) {
        console.error('Failed to load top workers:', error);
      }
      if (topWorkers.length === 0) {
        setTopWorkers([]);
      }
    } finally {
      setIsLoadingWorkers(false);
    }
  }, [topWorkers.length]);

  const loadTopVendors = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await cache.get<Vendor[]>(CACHE_KEYS.TOP_VENDORS);
        if (cached) {
          setTopVendors(cached);
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
        if (response.data.user_subscription) {
          setHasActiveSubscription(
            response.data.user_subscription.has_active_subscription
          );
        }

        setTopVendors(response.data.vendors);
        await cache.set(CACHE_KEYS.TOP_VENDORS, response.data.vendors, { ttl: CACHE_TTL.VENDORS });
      } else {
        setTopVendors([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      if (!errorMessage.includes('Subscription required')) {
        console.error('Failed to load top vendors:', error);
      }
      if (topVendors.length === 0) {
        setTopVendors([]);
      }
    } finally {
      setIsLoadingVendors(false);
    }
  }, [topVendors.length]);

  // Refresh function to force reload all data
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadBanners(true),
        loadCategories(true),
        loadHomepageIcons(true),
        loadPopularServices(true),
        loadProperties(true),
        loadHomeServices(true),
        loadConstructionServices(true),
        loadFixedPriceServices(true),
        loadInquiryServices(true),
        loadProperties2BHK(true),
        loadProperties3BHK(true),
        loadPropertiesUnder10K(true),
        loadTopWorkers(true),
        loadTopVendors(true),
        ...(isAuthenticated ? [loadProjects(true)] : []),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [
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

  // Initial load
  useEffect(() => {
    loadBanners();
    loadCategories();
    loadHomepageIcons();
    loadPopularServices();
    loadProperties();
    loadHomeServices();
    loadConstructionServices();
    loadFixedPriceServices();
    loadInquiryServices();
    loadProperties2BHK();
    loadProperties3BHK();
    loadPropertiesUnder10K();
    loadTopWorkers();
    loadTopVendors();
    if (isAuthenticated) {
      loadProjects();
    }
  }, [
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
    refresh,
    isRefreshing,
  };
}
