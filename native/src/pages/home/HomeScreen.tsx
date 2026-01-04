import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Alert, StatusBar, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import HomeHeader from './components/HomeHeader';
import SearchIcon from '../../components/icons/SearchIcon';
import ServiceCard from '../../components/ServiceCard';
import PropertyCardCompact from '../../components/PropertyCardCompact';
import PropertyDetailBottomSheet from './components/PropertyDetailBottomSheet';
import ServiceDetailBottomSheet from './components/ServiceDetailBottomSheet';
import CategoryBottomSheet from './components/CategoryBottomSheet';
import ProjectDetailBottomSheet from './components/ProjectDetailBottomSheet';
import { bannerService, PromotionBanner, categoryService, Category, homepageIconService, HomepageCategoryIcon, serviceService, Service, propertyService, Property, projectService, Project, workerService, Worker, vendorService, Vendor, VendorFilters } from '../../services';
import { PropertyFilters } from '../properties/components/FilterBottomSheet';
import { ServiceFilters } from '../services/components/ServiceFilterBottomSheet';
import { WorkerFilters } from '../workers/components/WorkerFilterBottomSheet';
import ProjectCard from '../../components/ProjectCard';
import WorkerCard from '../../components/WorkerCard';
import WorkerDetailBottomSheet from '../workers/components/WorkerDetailBottomSheet';
import VendorCard from '../../components/VendorCard';
import VendorDetailBottomSheet from '../../components/VendorDetailBottomSheet';
import SubscriptionRequiredBottomSheet from '../../components/SubscriptionRequiredBottomSheet';
import NotFoundIcon from '../../components/icons/NotFoundIcon';
import ImageWithSkeleton from '../../components/ImageWithSkeleton';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_ASPECT_RATIO = 16 / 9;
const BANNER_HEIGHT = SCREEN_WIDTH / BANNER_ASPECT_RATIO;

export interface ProjectFilters {
  project_type?: string;
  status?: string;
  state?: string;
  city?: string;
}

interface HomeScreenProps {
  onNavigateToAddressSelection?: () => void;
  onNavigateToServiceSearch?: () => void;
  onNavigateToProperties?: (filters?: PropertyFilters) => void;
  onNavigateToServices?: (filters?: ServiceFilters) => void;
  onNavigateToProjects?: (filters?: ProjectFilters) => void;
  onNavigateToWorkers?: (filters?: WorkerFilters) => void;
  onNavigateToVendors?: (filters?: VendorFilters) => void;
  onNavigateToCategoryServices?: (category: Category) => void;
  onNavigateToSubscription?: () => void;
  addressRefreshTrigger?: number; // Trigger to refresh address when returning from selection
}

export default function HomeScreen({ onNavigateToAddressSelection, onNavigateToServiceSearch, onNavigateToProperties, onNavigateToServices, onNavigateToProjects, onNavigateToWorkers, onNavigateToVendors, onNavigateToCategoryServices, onNavigateToSubscription, addressRefreshTrigger }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [banners, setBanners] = useState<PromotionBanner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [homepageIcons, setHomepageIcons] = useState<HomepageCategoryIcon[]>([]);
  const [isLoadingIcons, setIsLoadingIcons] = useState(true);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  
  // Home Services Section
  const [homeServices, setHomeServices] = useState<Service[]>([]);
  const [isLoadingHomeServices, setIsLoadingHomeServices] = useState(true);
  
  // Construction Services Section
  const [constructionServices, setConstructionServices] = useState<Service[]>([]);
  const [isLoadingConstructionServices, setIsLoadingConstructionServices] = useState(true);
  
  // 2 BHK Rental Properties
  const [properties2BHK, setProperties2BHK] = useState<Property[]>([]);
  const [isLoadingProperties2BHK, setIsLoadingProperties2BHK] = useState(true);
  
  // 3 BHK Properties
  const [properties3BHK, setProperties3BHK] = useState<Property[]>([]);
  const [isLoadingProperties3BHK, setIsLoadingProperties3BHK] = useState(true);
  
  // Properties under 10000 monthly rent
  const [propertiesUnder10K, setPropertiesUnder10K] = useState<Property[]>([]);
  const [isLoadingPropertiesUnder10K, setIsLoadingPropertiesUnder10K] = useState(true);

  // Projects Section
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Workers Section
  const [topWorkers, setTopWorkers] = useState<Worker[]>([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true);

  // Vendors Section
  const [topVendors, setTopVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);

  // Bottom Sheet States
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyDetailSheet, setShowPropertyDetailSheet] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceDetailSheet, setShowServiceDetailSheet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetailSheet, setShowProjectDetailSheet] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showWorkerDetailSheet, setShowWorkerDetailSheet] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorDetailSheet, setShowVendorDetailSheet] = useState(false);

  // Subscription state
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showSubscriptionSheet, setShowSubscriptionSheet] = useState(false);

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
    loadProperties2BHK();
    loadProperties3BHK();
    loadPropertiesUnder10K();
    loadTopWorkers();
    loadTopVendors();
    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (banners.length > 1) {
      startAutoSlide();
    }
    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners.length, currentBannerIndex]);

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
        max_price: 10000,
      });
      if (response.data && Array.isArray(response.data)) {
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
      const response = await projectService.getAllProjects(1, 20);

      if (response.success && response.data) {
        // Parse subscription status
        if (response.data.user_subscription) {
          setHasActiveSubscription(
            response.data.user_subscription.has_active_subscription
          );
        }

        // Handle projects array
        const projectsData = response.data.projects || [];
        const projectsWithImages = projectsData.filter(proj =>
          proj.images && Array.isArray(proj.images) && proj.images.length > 0
        );
        const projectsToShow = projectsWithImages.length > 0
          ? projectsWithImages.slice(0, 10)
          : projectsData.slice(0, 10);
        setProjects(projectsToShow);
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

  const startAutoSlide = () => {
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
    }
    autoSlideTimerRef.current = setInterval(() => {
      setCurrentBannerIndex((prev) => {
        const nextIndex = prev < banners.length - 1 ? prev + 1 : 0;
        scrollToBanner(nextIndex);
        return nextIndex;
      });
    }, 5000); // 5 seconds like Flutter
  };

  const scrollToBanner = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentBannerIndex(index);
    // Restart auto-slide timer when user manually swipes
    if (banners.length > 1) {
      startAutoSlide();
    }
  };

  const handleAddressPress = () => {
    if (onNavigateToAddressSelection) {
      onNavigateToAddressSelection();
    } else {
      Alert.alert('Address', 'Address selection will be implemented here.');
    }
  };

  const handleNotificationPress = () => {
    // TODO: Navigate to notifications screen
    Alert.alert('Notifications', 'Notifications screen will be implemented here.');
  };

  const handleBannerPress = (banner: PromotionBanner) => {
    if (banner.link && banner.link.trim() !== '') {
      // TODO: Handle banner link - navigate to URL or specific screen
      // Parse link similar to Flutter implementation
    }
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category);
    setShowCategorySheet(true);
  };

  // Fixed categories matching Flutter implementation
  const fixedCategories = [
    { slug: 'home-services', title: 'Home Service', name: 'Home Service' },
    { slug: 'construction-services', title: 'Construction Service', name: 'Construction Service' },
    { slug: 'marketplace', title: 'Marketplace', name: 'Marketplace' },
  ];

  const getCategoryEntity = (slug: string): Category | null => {
    return categories.find((cat) => cat.slug === slug) || null;
  };

  const getHomepageIcon = (categoryName: string): HomepageCategoryIcon | null => {
    return homepageIcons.find((icon) => icon.name.toLowerCase() === categoryName.toLowerCase()) || null;
  };

  const handleProjectPress = (project: Project) => {
    if (!hasActiveSubscription) {
      setShowSubscriptionSheet(true);
      return;
    }
    setSelectedProject(project);
    setShowProjectDetailSheet(true);
  };

  const handleWorkerPress = (worker: Worker) => {
    if (!hasActiveSubscription) {
      setShowSubscriptionSheet(true);
      return;
    }
    setSelectedWorker(worker);
    setShowWorkerDetailSheet(true);
  };

  const handleVendorPress = (vendor: Vendor) => {
    if (!hasActiveSubscription) {
      setShowSubscriptionSheet(true);
      return;
    }
    setSelectedVendor(vendor);
    setShowVendorDetailSheet(true);
  };

  const handleSubscribePress = () => {
    setShowSubscriptionSheet(false);
    if (onNavigateToSubscription) {
      onNavigateToSubscription();
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header with Address and Bell Icon - Fixed at top with safe area */}
      <View style={{ paddingTop: insets.top, backgroundColor: 'white' }}>
        <HomeHeader
          onAddressPress={handleAddressPress}
          onNotificationPress={handleNotificationPress}
          refreshTrigger={addressRefreshTrigger}
        />
      </View>

      {/* Search Bar - Fixed at top */}
      <View className="px-6 pt-4 pb-4" style={{ backgroundColor: 'white' }}>
        <TouchableOpacity
          onPress={() => {
            if (onNavigateToServiceSearch) {
              onNavigateToServiceSearch();
            }
          }}
          activeOpacity={0.7}
        >
          <View className="bg-white rounded-xl border border-[#E5E7EB] flex-row items-center px-4 py-3">
            <SearchIcon size={20} color="#6B7280" />
            <Text
              className="flex-1 ml-3 text-base text-[#6B7280]"
              style={{ fontFamily: 'Inter-Regular' }}
            >
              Search for services...
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >

        {/* Banner Section */}
        {!isLoadingBanners && banners.length > 0 && (
          <View className="pt-4 pb-4" style={{ backgroundColor: 'white' }}>
            <View>
              <View
                style={{
                  height: BANNER_HEIGHT,
                  borderRadius: 0,
                  overflow: 'hidden',
                }}
              >
                <ScrollView
                  ref={scrollViewRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={handleScroll}
                  scrollEventThrottle={16}
                  decelerationRate="fast"
                >
                  {banners.map((banner, index) => (
                    <TouchableOpacity
                      key={banner.id || banner.ID || index}
                      activeOpacity={0.9}
                      onPress={() => handleBannerPress(banner)}
                      style={{ width: SCREEN_WIDTH }}
                    >
                      <ImageWithSkeleton
                        source={{ uri: banner.image }}
                        style={{
                          width: SCREEN_WIDTH,
                          height: BANNER_HEIGHT,
                        }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              {/* Page Indicators */}
              {banners.length > 1 && (
                <View className="flex-row justify-center mt-3" style={{ gap: 6 }}>
                  {banners.map((_, index) => (
                    <View
                      key={index}
                      style={{
                        width: currentBannerIndex === index ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: currentBannerIndex === index ? '#00a871' : '#D1D5DB',
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* What are you looking for Section */}
        <View className="px-6 pt-4 pb-4">
          <Text
            className="text-xl font-bold text-[#111928] mb-4"
            style={{ fontFamily: 'Inter-Bold' }}
          >
            What are you looking for?
          </Text>
          
          {isLoadingCategories || isLoadingIcons ? (
            <View className="flex-row" style={{ gap: 8 }}>
              {[1, 2, 3].map((index) => (
                <View key={index} className="flex-1 bg-[#F5F5F5] rounded-lg" style={{ height: 120 }}>
                  <ActivityIndicator size="small" color="#00a871" className="mt-10" />
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-row" style={{ gap: 8 }}>
              {fixedCategories.map((fixedCategory, index) => {
                const categoryEntity = getCategoryEntity(fixedCategory.slug);
                const homepageIcon = getHomepageIcon(fixedCategory.name);
                const iconUrl = homepageIcon?.icon_url;
                // Check if icon is a URL (http/https)
                const isImageUrl = iconUrl && iconUrl.trim() !== '' && (iconUrl.startsWith('http://') || iconUrl.startsWith('https://'));
                
                return (
                  <TouchableOpacity
                    key={fixedCategory.slug}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (categoryEntity) {
                        handleCategoryPress(categoryEntity);
                      } else {
                        handleCategoryPress({
                          id: index + 1,
                          name: fixedCategory.title,
                          slug: fixedCategory.slug,
                          is_active: true,
                        });
                      }
                    }}
                    className="flex-1"
                  >
                    <View className="bg-[#F5F5F5] rounded-lg" style={{ height: 120 }}>
                      {/* Icon container - fixed height */}
                      <View className="items-center justify-center" style={{ height: 80 }}>
                        {isImageUrl ? (
                          <ImageWithSkeleton
                            source={{ uri: iconUrl }}
                            style={{ width: 40, height: 40 }}
                            resizeMode="contain"
                          />
                        ) : (
                          <NotFoundIcon size={40} color="#9CA3AF" />
                        )}
                      </View>
                      {/* Title - fixed position */}
                      <View className="px-2" style={{ height: 40, justifyContent: 'flex-start' }}>
                        <Text
                          className="text-sm font-medium text-[#111928] text-center"
                          style={{ fontFamily: 'Inter-Medium' }}
                          numberOfLines={2}
                        >
                          {categoryEntity?.name || fixedCategory.title}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Popular Services Section - Urban Company Style */}
        {!isLoadingServices && popularServices.length > 0 && (
          <View className="pt-4 pb-4">
            <View className="flex-row justify-between items-center mb-4 px-6">
              <Text
                className="text-xl font-bold text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                All services
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (onNavigateToServices) {
                    onNavigateToServices();
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-medium text-[#00a871]"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 240 }}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 24 }}
              >
                {popularServices.map((service, index) => (
                  <View 
                    key={service.id || service.ID || index} 
                    style={{ marginLeft: index === 0 ? 24 : 16 }}
                  >
                    <ServiceCard
                      service={service}
                      onPress={() => {
                        setSelectedService(service);
                        setShowServiceDetailSheet(true);
                      }}
                      onBook={() => {
                        setSelectedService(service);
                        setShowServiceDetailSheet(true);
                      }}
                      showBookButton={true}
                      width={200}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Properties Section */}
        {!isLoadingProperties && properties.length > 0 && (
          <View className="pt-4 pb-4">
            <View className="flex-row justify-between items-center mb-4 px-6">
              <Text
                className="text-xl font-bold text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                Properties
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (onNavigateToProperties) {
                    onNavigateToProperties();
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-medium text-[#00a871]"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 240 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 24 }}
              >
                {properties.map((property, index) => (
                  <View
                    key={property.id}
                    style={{ marginLeft: index === 0 ? 24 : 16 }}
                  >
                    <PropertyCardCompact
                      property={property}
                      onPress={() => {
                        setSelectedProperty(property);
                        setShowPropertyDetailSheet(true);
                      }}
                      width={200}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Projects Section */}
        {!isLoadingProjects && projects.length > 0 && (
          <View className="pt-4 pb-4">
            <View className="flex-row justify-between items-center mb-4 px-6">
              <Text
                className="text-xl font-bold text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                Projects
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (onNavigateToProjects) {
                    onNavigateToProjects();
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-medium text-[#00a871]"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 240 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 24 }}
              >
                {projects.map((project, index) => (
                  <View
                    key={project.id}
                    style={{ marginLeft: index === 0 ? 24 : 16 }}
                  >
                    <ProjectCard
                      project={project}
                      onPress={() => handleProjectPress(project)}
                      shouldBlur={!hasActiveSubscription}
                      width={200}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Home Services Section */}
        {!isLoadingHomeServices && homeServices.length > 0 && (
          <View className="pt-4 pb-4">
            <View className="flex-row justify-between items-center mb-4 px-6">
              <Text
                className="text-xl font-bold text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                Home Services
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (onNavigateToServices) {
                    onNavigateToServices({
                      category: 'Home Services',
                    });
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-medium text-[#00a871]"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 240 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 24 }}
              >
                {homeServices.map((service, index) => (
                  <View
                    key={service.id || service.ID || index}
                    style={{ marginLeft: index === 0 ? 24 : 16 }}
                  >
                    <ServiceCard
                      service={service}
                      onPress={() => {
                        setSelectedService(service);
                        setShowServiceDetailSheet(true);
                      }}
                      onBook={() => {
                        setSelectedService(service);
                        setShowServiceDetailSheet(true);
                      }}
                      showBookButton={true}
                      width={200}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Top Rated Workers Section */}
        {!isLoadingWorkers && topWorkers.length > 0 && (
          <View className="pt-4 pb-4">
            <View className="flex-row justify-between items-center mb-4 px-6">
              <Text
                className="text-xl font-bold text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                Top Rated Workers
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (onNavigateToWorkers) {
                    onNavigateToWorkers();
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-medium text-[#00a871]"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 240 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 24 }}
              >
                {topWorkers.map((worker, index) => (
                  <View
                    key={worker.id}
                    style={{ marginLeft: index === 0 ? 24 : 16 }}
                  >
                    <WorkerCard
                      worker={worker}
                      onPress={() => handleWorkerPress(worker)}
                      shouldBlur={!hasActiveSubscription}
                      width={200}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Top Vendors Section */}
        {!isLoadingVendors && topVendors.length > 0 && (
          <View className="pt-4 pb-4">
            <View className="flex-row justify-between items-center mb-4 px-6">
              <Text
                className="text-xl font-bold text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                Top Vendors
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (onNavigateToVendors) {
                    onNavigateToVendors();
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-medium text-[#00a871]"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 240 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 24 }}
              >
                {topVendors.map((vendor, index) => (
                  <View
                    key={vendor.id}
                    style={{ marginLeft: index === 0 ? 24 : 16 }}
                  >
                    <VendorCard
                      vendor={vendor}
                      onPress={() => handleVendorPress(vendor)}
                      shouldBlur={!hasActiveSubscription}
                      width={200}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* 2 BHK Rental Properties Section */}
        {properties2BHK.length > 0 && (
          <View className="pt-4 pb-4">
            <View className="flex-row justify-between items-center mb-4 px-6">
              <Text
                className="text-xl font-bold text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                2 BHK for Rent
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (onNavigateToProperties) {
                    onNavigateToProperties({
                      listing_type: 'rent',
                      bedrooms: 2,
                    });
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-medium text-[#00a871]"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            {isLoadingProperties2BHK ? (
              <View style={{ height: 240 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[1, 2, 3].map((index) => (
                    <View
                      key={index}
                      className="bg-white rounded-xl"
                      style={{ width: 200, height: 240, marginLeft: index === 0 ? 24 : 16 }}
                    >
                      <View className="h-32 bg-[#F3F4F6] rounded-t-xl mb-2" />
                      <View className="px-2">
                        <View className="h-3 bg-gray-200 rounded mb-2" />
                        <View className="h-2 bg-gray-200 rounded w-2/3" />
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={{ height: 240 }}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 24 }}
                >
                  {properties2BHK.map((property, index) => (
                    <View 
                      key={property.id} 
                      style={{ marginLeft: index === 0 ? 24 : 16 }}
                    >
                      <PropertyCardCompact
                        property={property}
                        onPress={() => {
                          setSelectedProperty(property);
                          setShowPropertyDetailSheet(true);
                        }}
                        width={200}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* 3 BHK Properties Section */}
        {properties3BHK.length > 0 && (
          <View className="pt-4 pb-4">
            <View className="flex-row justify-between items-center mb-4 px-6">
              <Text
                className="text-xl font-bold text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                3 BHK Properties
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (onNavigateToProperties) {
                    onNavigateToProperties({
                      bedrooms: 3,
                    });
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-medium text-[#00a871]"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            {isLoadingProperties3BHK ? (
              <View style={{ height: 240 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[1, 2, 3].map((index) => (
                    <View
                      key={index}
                      className="bg-white rounded-xl"
                      style={{ width: 200, height: 240, marginLeft: index === 0 ? 24 : 16 }}
                    >
                      <View className="h-32 bg-[#F3F4F6] rounded-t-xl mb-2" />
                      <View className="px-2">
                        <View className="h-3 bg-gray-200 rounded mb-2" />
                        <View className="h-2 bg-gray-200 rounded w-2/3" />
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={{ height: 240 }}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 24 }}
                >
                  {properties3BHK.map((property, index) => (
                    <View 
                      key={property.id} 
                      style={{ marginLeft: index === 0 ? 24 : 16 }}
                    >
                      <PropertyCardCompact
                        property={property}
                        onPress={() => {
                          setSelectedProperty(property);
                          setShowPropertyDetailSheet(true);
                        }}
                        width={200}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Properties Under 10K Monthly Rent Section */}
        {!isLoadingPropertiesUnder10K && propertiesUnder10K.length > 0 && (
          <View className="pt-4 pb-4">
            <View className="flex-row justify-between items-center mb-4 px-6">
              <Text
                className="text-xl font-bold text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                Rentals Under ₹10,000
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (onNavigateToProperties) {
                    onNavigateToProperties();
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-medium text-[#00a871]"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 240 }}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 24 }}
              >
                {propertiesUnder10K.map((property, index) => (
                  <View 
                    key={property.id} 
                    style={{ marginLeft: index === 0 ? 24 : 16 }}
                  >
                    <PropertyCardCompact
                      property={property}
                      width={200}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Construction Services Section */}
        {!isLoadingConstructionServices && constructionServices.length > 0 && (
          <View className="pt-4 pb-4">
            <View className="flex-row justify-between items-center mb-4 px-6">
              <Text
                className="text-xl font-bold text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                Construction Services
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (onNavigateToServices) {
                    onNavigateToServices({
                      category: 'Construction Services',
                    });
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-medium text-[#00a871]"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 240 }}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 24 }}
              >
                {constructionServices.map((service, index) => (
                  <View 
                    key={service.id || service.ID || index} 
                    style={{ marginLeft: index === 0 ? 24 : 16 }}
                  >
                    <ServiceCard
                      service={service}
                      onPress={() => {
                        setSelectedService(service);
                        setShowServiceDetailSheet(true);
                      }}
                      onBook={() => {
                        setSelectedService(service);
                        setShowServiceDetailSheet(true);
                      }}
                      showBookButton={true}
                      width={200}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Property Detail Bottom Sheet */}
      {selectedProperty && (
        <PropertyDetailBottomSheet
          visible={showPropertyDetailSheet}
          onClose={() => {
            setShowPropertyDetailSheet(false);
            setSelectedProperty(null);
          }}
          property={selectedProperty}
        />
      )}

      {/* Service Detail Bottom Sheet */}
      {selectedService && (
        <ServiceDetailBottomSheet
          visible={showServiceDetailSheet}
          onClose={() => {
            setShowServiceDetailSheet(false);
            setSelectedService(null);
          }}
          service={selectedService}
          onBook={() => {
            Alert.alert('Book Service', 'Booking feature will be implemented here.');
          }}
        />
      )}

      {/* Category Bottom Sheet */}
      <CategoryBottomSheet
        visible={showCategorySheet}
        onClose={() => {
          setShowCategorySheet(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSelectSubcategory={(subcategory) => {
          // Special handling for Properties subcategory - navigate without filters
          if (subcategory.name.toLowerCase() === 'properties' || subcategory.slug === 'rental-properties') {
            if (onNavigateToProperties) {
              onNavigateToProperties();
            }
          } else {
            // For Home Services and Construction Services, navigate to CategoryServicesScreen
            const isHomeOrConstruction = selectedCategory?.name.toLowerCase().includes('home service') ||
                                        selectedCategory?.name.toLowerCase().includes('construction service');

            if (isHomeOrConstruction && onNavigateToCategoryServices) {
              onNavigateToCategoryServices(subcategory);
            } else {
              // For other subcategories (Vendors, Workers), navigate to services with filter
              if (onNavigateToServices) {
                onNavigateToServices({
                  subcategory: subcategory.name,
                });
              }
            }
          }
        }}
      />

      {/* Project Detail Bottom Sheet */}
      {selectedProject && (
        <ProjectDetailBottomSheet
          visible={showProjectDetailSheet}
          onClose={() => {
            setShowProjectDetailSheet(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
        />
      )}

      {/* Worker Detail Bottom Sheet */}
      {selectedWorker && (
        <WorkerDetailBottomSheet
          visible={showWorkerDetailSheet}
          onClose={() => {
            setShowWorkerDetailSheet(false);
            setSelectedWorker(null);
          }}
          worker={selectedWorker}
        />
      )}

      {/* Vendor Detail Bottom Sheet */}
      {selectedVendor && (
        <VendorDetailBottomSheet
          visible={showVendorDetailSheet}
          onClose={() => {
            setShowVendorDetailSheet(false);
            setSelectedVendor(null);
          }}
          vendor={selectedVendor}
        />
      )}

      {/* Subscription Required Bottom Sheet */}
      <SubscriptionRequiredBottomSheet
        visible={showSubscriptionSheet}
        onClose={() => setShowSubscriptionSheet(false)}
        onSubscribe={handleSubscribePress}
        contentType="project"
      />
    </View>
  );
}


