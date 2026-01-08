import { useState, useEffect } from 'react';
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

  // Load functions
  const loadBanners = async () => {
    try {
      setIsLoadingBanners(true);
      const promotionBanners = await bannerService.getPromotionBanners();
      setBanners(promotionBanners);
    } catch (error) {
      console.error('Failed to load banners:', error);
      setBanners([]);
    } finally {
      setIsLoadingBanners(false);
    }
  };

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const rootCategories = await categoryService.getRootCategories(true);
      setCategories(rootCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadHomepageIcons = async () => {
    try {
      setIsLoadingIcons(true);
      const icons = await homepageIconService.getActiveIcons();
      setHomepageIcons(icons);
    } catch (error) {
      console.error('Failed to load homepage icons:', error);
      setHomepageIcons([]);
    } finally {
      setIsLoadingIcons(false);
    }
  };

  const loadPopularServices = async () => {
    try {
      setIsLoadingServices(true);
      const services = await serviceService.getPopularServices();
      setPopularServices(services);
    } catch (error) {
      console.error('Failed to load popular services:', error);
      setPopularServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const loadProperties = async () => {
    try {
      setIsLoadingProperties(true);
      const response = await propertyService.getAllProperties(1, 20);
      if (response.data && Array.isArray(response.data)) {
        const propertiesWithImages = response.data.filter(prop =>
          prop.images && Array.isArray(prop.images) && prop.images.length > 0
        );
        const propertiesToShow = propertiesWithImages.length > 0
          ? propertiesWithImages.slice(0, 10)
          : response.data.slice(0, 10);
        setProperties(propertiesToShow);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
      setProperties([]);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const loadHomeServices = async () => {
    try {
      setIsLoadingHomeServices(true);
      const services = await serviceService.getServicesByCategory('Home Services', 10);
      setHomeServices(services);
    } catch (error) {
      console.error('Failed to load home services:', error);
      setHomeServices([]);
    } finally {
      setIsLoadingHomeServices(false);
    }
  };

  const loadConstructionServices = async () => {
    try {
      setIsLoadingConstructionServices(true);
      const services = await serviceService.getServicesByCategory('Construction Services', 10);
      setConstructionServices(services);
    } catch (error) {
      console.error('Failed to load construction services:', error);
      setConstructionServices([]);
    } finally {
      setIsLoadingConstructionServices(false);
    }
  };

  const loadFixedPriceServices = async () => {
    try {
      setIsLoadingFixedPriceServices(true);
      const response = await serviceService.getServicesWithFilters({
        page: 1,
        limit: 10,
        price_type: 'fixed',
      });
      if (response.data) {
        setFixedPriceServices(response.data);
      } else {
        setFixedPriceServices([]);
      }
    } catch (error) {
      console.error('Failed to load fixed price services:', error);
      setFixedPriceServices([]);
    } finally {
      setIsLoadingFixedPriceServices(false);
    }
  };

  const loadInquiryServices = async () => {
    try {
      setIsLoadingInquiryServices(true);
      const response = await serviceService.getServicesWithFilters({
        page: 1,
        limit: 10,
        price_type: 'inquiry',
      });
      if (response.data) {
        setInquiryServices(response.data);
      } else {
        setInquiryServices([]);
      }
    } catch (error) {
      console.error('Failed to load inquiry services:', error);
      setInquiryServices([]);
    } finally {
      setIsLoadingInquiryServices(false);
    }
  };

  const loadProperties2BHK = async () => {
    try {
      setIsLoadingProperties2BHK(true);
      const response = await propertyService.getPropertiesWithFilters({
        page: 1,
        limit: 20,
        listing_type: 'rent',
        bedrooms: 2,
      });
      if (response.data) {
        setProperties2BHK(response.data.slice(0, 10));
      } else {
        setProperties2BHK([]);
      }
    } catch (error) {
      console.error('Failed to load 2 BHK properties:', error);
      setProperties2BHK([]);
    } finally {
      setIsLoadingProperties2BHK(false);
    }
  };

  const loadProperties3BHK = async () => {
    try {
      setIsLoadingProperties3BHK(true);
      const response = await propertyService.getPropertiesWithFilters({
        page: 1,
        limit: 20,
        listing_type: 'rent',
        bedrooms: 3,
      });
      if (response.data) {
        setProperties3BHK(response.data.slice(0, 10));
      } else {
        setProperties3BHK([]);
      }
    } catch (error) {
      console.error('Failed to load 3 BHK properties:', error);
      setProperties3BHK([]);
    } finally {
      setIsLoadingProperties3BHK(false);
    }
  };

  const loadPropertiesUnder10K = async () => {
    try {
      setIsLoadingPropertiesUnder10K(true);
      const response = await propertyService.getPropertiesWithFilters({
        page: 1,
        limit: 20,
        listing_type: 'rent',
        max_rent: 10000,
      });
      if (response.data) {
        setPropertiesUnder10K(response.data.slice(0, 10));
      } else {
        setPropertiesUnder10K([]);
      }
    } catch (error) {
      console.error('Failed to load properties under 10K:', error);
      setPropertiesUnder10K([]);
    } finally {
      setIsLoadingPropertiesUnder10K(false);
    }
  };

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const response = await projectService.getProjectsWithFilters({
        page: 1,
        limit: 10,
      });

      if (response.success && response.data) {
        // Parse subscription status
        if (response.data.user_subscription) {
          setHasActiveSubscription(
            response.data.user_subscription.has_active_subscription
          );
        }

        setProjects(response.data.projects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      // Silently handle subscription errors - projects section just won't show
      const errorMessage = error instanceof Error ? error.message : '';
      if (!errorMessage.includes('Subscription required')) {
        console.error('Failed to load projects:', error);
      }
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadTopWorkers = async () => {
    try {
      setIsLoadingWorkers(true);

      const response = await workerService.getWorkersWithFilters({
        page: 1,
        limit: 10,
        is_active: true,
        sortBy: 'rating',
        sortOrder: 'desc',
      });

      if (response.success && response.data) {
        // Parse subscription status
        if (response.data.user_subscription) {
          setHasActiveSubscription(
            response.data.user_subscription.has_active_subscription
          );
        }

        setTopWorkers(response.data.workers);
      } else {
        setTopWorkers([]);
      }
    } catch (error) {
      // Silently handle subscription errors - workers section just won't show
      const errorMessage = error instanceof Error ? error.message : '';
      if (!errorMessage.includes('Subscription required')) {
        console.error('Failed to load top workers:', error);
      }
      setTopWorkers([]);
    } finally {
      setIsLoadingWorkers(false);
    }
  };

  const loadTopVendors = async () => {
    try {
      setIsLoadingVendors(true);

      const response = await vendorService.getVendorsWithFilters({
        page: 1,
        limit: 10,
      });

      if (response.success && response.data) {
        // Parse subscription status
        if (response.data.user_subscription) {
          setHasActiveSubscription(
            response.data.user_subscription.has_active_subscription
          );
        }

        setTopVendors(response.data.vendors);
      } else {
        setTopVendors([]);
      }
    } catch (error) {
      // Silently handle subscription errors - vendors section just won't show
      const errorMessage = error instanceof Error ? error.message : '';
      if (!errorMessage.includes('Subscription required')) {
        console.error('Failed to load top vendors:', error);
      }
      setTopVendors([]);
    } finally {
      setIsLoadingVendors(false);
    }
  };

  useEffect(() => {
    loadBanners();
    loadCategories();
    loadHomepageIcons();
    loadPopularServices();
    loadProperties();
    if (isAuthenticated) {
      loadProjects();
    }
    loadHomeServices();
    loadConstructionServices();
    loadFixedPriceServices();
    loadInquiryServices();
    loadProperties2BHK();
    loadProperties3BHK();
    loadPropertiesUnder10K();
    loadTopWorkers();
    loadTopVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

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
  };
}
