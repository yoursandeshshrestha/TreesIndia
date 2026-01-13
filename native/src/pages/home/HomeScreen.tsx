import React, { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Alert, StatusBar, TouchableOpacity, RefreshControl, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import HomeHeader from './components/HomeHeader';
import SearchIcon from '../../components/icons/SearchIcon';
import PropertyDetailBottomSheet from './components/PropertyDetailBottomSheet';
import ServiceDetailBottomSheet from './components/ServiceDetailBottomSheet';
import CategoryBottomSheet from './components/CategoryBottomSheet';
import ProjectDetailBottomSheet from './components/ProjectDetailBottomSheet';
import WorkerDetailBottomSheet from '../workers/components/WorkerDetailBottomSheet';
import VendorDetailBottomSheet from '../../components/VendorDetailBottomSheet';
import SubscriptionRequiredBottomSheet from '../../components/SubscriptionRequiredBottomSheet';
import BannerCarousel from './components/BannerCarousel';
import CategoryGrid from './components/CategoryGrid';
import ServicesSection from './components/ServicesSection';
import PropertiesSection from './components/PropertiesSection';
import ProjectsSection from './components/ProjectsSection';
import WorkersSection from './components/WorkersSection';
import VendorsSection from './components/VendorsSection';
import { useHomeData, type SectionType } from './hooks/useHomeData';
import { PromotionBanner, Category, Service, Property, Project, Worker, Vendor, VendorFilters } from '../../services';
import { PropertyFilters } from '../properties/components/FilterBottomSheet';
import { ServiceFilters } from '../services/components/ServiceFilterBottomSheet';
import { type WorkerFilters } from '../../services';

export interface ProjectFilters {
  project_type?: string;
  status?: string;
  state?: string;
  city?: string;
}

interface HomeScreenProps {
  onNavigateToAddressSelection?: () => void;
  onNavigateToServiceSearch?: () => void;
  onNavigateToBookingFlow?: (service: Service) => void;
  onNavigateToProperties?: (filters?: PropertyFilters) => void;
  onNavigateToServices?: (filters?: ServiceFilters) => void;
  onNavigateToProjects?: (filters?: ProjectFilters) => void;
  onNavigateToWorkers?: (filters?: WorkerFilters) => void;
  onNavigateToVendors?: (filters?: VendorFilters) => void;
  onNavigateToCategoryServices?: (category: Category) => void;
  onNavigateToSubscription?: () => void;
  addressRefreshTrigger?: number;
}

export default function HomeScreen({
  onNavigateToAddressSelection,
  onNavigateToServiceSearch,
  onNavigateToBookingFlow,
  onNavigateToProperties,
  onNavigateToServices,
  onNavigateToProjects,
  onNavigateToWorkers,
  onNavigateToVendors,
  onNavigateToCategoryServices,
  onNavigateToSubscription,
  addressRefreshTrigger,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Load all home data using custom hook
  const homeData = useHomeData(isAuthenticated);

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
  const [showSubscriptionSheet, setShowSubscriptionSheet] = useState(false);

  // Track section positions
  const sectionPositions = useRef<{ [key: string]: number }>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const lastScrollY = useRef(0);

  // Handle section layout to track position
  const handleSectionLayout = useCallback((sectionKey: SectionType, y: number) => {
    sectionPositions.current[sectionKey] = y;
  }, []);

  // Handle scroll to trigger lazy loading
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
    lastScrollY.current = currentScrollY;

    // Only trigger loading when scrolling down
    if (scrollDirection !== 'down') return;

    // Measure sections and trigger loading when they're about to become visible
    const viewportHeight = event.nativeEvent.layoutMeasurement.height;
    const triggerOffset = viewportHeight * 0.8; // Trigger when section is 80% of viewport away

    // Check each section
    Object.entries(sectionPositions.current).forEach(([sectionKey, sectionY]) => {
      // If section is approaching viewport, load it
      if (sectionY - currentScrollY < viewportHeight + triggerOffset) {
        homeData.loadSection(sectionKey as SectionType);
      }
    });
  }, [homeData]);

  // Event Handlers
  const handleAddressPress = () => {
    if (onNavigateToAddressSelection) {
      onNavigateToAddressSelection();
    } else {
      Alert.alert('Address', 'Address selection will be implemented here.');
    }
  };

  const handleBannerPress = (banner: PromotionBanner) => {
    // Try to parse the banner link as JSON for navigation
    if (banner.link && banner.link.trim() !== '') {
      try {
        const parsed = JSON.parse(banner.link);

        // Navigate based on screen type
        if (parsed.screen === 'browseServices' && onNavigateToServices) {
          onNavigateToServices(parsed.filters || {});
          return;
        } else if (parsed.screen === 'browseProperties' && onNavigateToProperties) {
          onNavigateToProperties(parsed.filters || {});
          return;
        } else if (parsed.screen === 'browseProjects' && onNavigateToProjects) {
          onNavigateToProjects(parsed.filters || {});
          return;
        } else if (parsed.screen === 'browseWorkers' && onNavigateToWorkers) {
          onNavigateToWorkers(parsed.filters || {});
          return;
        } else if (parsed.screen === 'browseVendors' && onNavigateToVendors) {
          onNavigateToVendors(parsed.filters || {});
          return;
        }
      } catch (error) {
        // If JSON parsing fails, fallback to services page
      }
    }

    // Fallback: Always navigate to services page if link is missing or invalid
    if (onNavigateToServices) {
      onNavigateToServices({});
    }
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category);
    setShowCategorySheet(true);
  };

  const handleServicePress = (service: Service) => {
    setSelectedService(service);
    setShowServiceDetailSheet(true);
  };

  const handlePropertyPress = (property: Property) => {
    setSelectedProperty(property);
    setShowPropertyDetailSheet(true);
  };

  const handleProjectPress = (project: Project) => {
    if (!homeData.hasActiveSubscription) {
      setShowSubscriptionSheet(true);
      return;
    }
    setSelectedProject(project);
    setShowProjectDetailSheet(true);
  };

  const handleWorkerPress = (worker: Worker) => {
    if (!homeData.hasActiveSubscription) {
      setShowSubscriptionSheet(true);
      return;
    }
    setSelectedWorker(worker);
    setShowWorkerDetailSheet(true);
  };

  const handleVendorPress = (vendor: Vendor) => {
    if (!homeData.hasActiveSubscription) {
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

      {/* Header with Address - Fixed at top with safe area */}
      <View style={{ paddingTop: insets.top }}>
        <HomeHeader
          onAddressPress={handleAddressPress}
          refreshTrigger={addressRefreshTrigger}
        />
      </View>

      {/* Search Bar - Fixed at top */}
      <View className="px-6 pb-3">
        <TouchableOpacity
          className="flex-row items-center bg-[#F3F4F6] rounded-lg px-4"
          style={{ height: 48 }}
          activeOpacity={0.7}
          onPress={() => {
            if (onNavigateToServiceSearch) {
              onNavigateToServiceSearch();
            }
          }}
        >
          <SearchIcon size={20} color="#6B7280" />
          <Text className="ml-3 text-sm text-[#9CA3AF]" style={{ fontFamily: 'Inter-Regular' }}>
            Search for services
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={homeData.isRefreshing}
            onRefresh={homeData.refresh}
            colors={['#34A853']}
            tintColor="#34A853"
          />
        }
      >
        {/* Banner Carousel */}
        <BannerCarousel
          banners={homeData.banners}
          isLoading={homeData.isLoadingBanners}
          onBannerPress={handleBannerPress}
        />

        {/* Category Grid */}
        <CategoryGrid
          categories={homeData.categories}
          homepageIcons={homeData.homepageIcons}
          isLoading={homeData.isLoadingCategories || homeData.isLoadingIcons}
          onCategoryPress={handleCategoryPress}
        />

        {/* Popular Services */}
        <ServicesSection
          title="Popular Services"
          services={homeData.popularServices}
          isLoading={homeData.isLoadingServices}
          onServicePress={handleServicePress}
          onSeeAll={() => onNavigateToServices?.()}
        />

        {/* Properties */}
        <View onLayout={(e) => handleSectionLayout('properties', e.nativeEvent.layout.y)}>
          <PropertiesSection
            title="Properties"
            properties={homeData.properties}
            isLoading={homeData.isLoadingProperties}
            onPropertyPress={handlePropertyPress}
            onSeeAll={() => onNavigateToProperties?.()}
          />
        </View>

        {/* Fixed Price Services */}
        <View onLayout={(e) => handleSectionLayout('fixedPriceServices', e.nativeEvent.layout.y)}>
          <ServicesSection
            title="Fixed Price Services"
            services={homeData.fixedPriceServices}
            isLoading={homeData.isLoadingFixedPriceServices}
            onServicePress={handleServicePress}
            onSeeAll={() => onNavigateToServices?.({ price_type: 'fixed' })}
          />
        </View>

        {/* Projects */}
        {isAuthenticated && (
          <View onLayout={(e) => handleSectionLayout('projects', e.nativeEvent.layout.y)}>
            <ProjectsSection
              projects={homeData.projects}
              isLoading={homeData.isLoadingProjects}
              hasActiveSubscription={homeData.hasActiveSubscription}
              onProjectPress={handleProjectPress}
              onSeeAll={() => onNavigateToProjects?.()}
            />
          </View>
        )}

        {/* Home Services */}
        <View onLayout={(e) => handleSectionLayout('homeServices', e.nativeEvent.layout.y)}>
          <ServicesSection
            title="Home Services"
            services={homeData.homeServices}
            isLoading={homeData.isLoadingHomeServices}
            onServicePress={handleServicePress}
            onSeeAll={() => onNavigateToServices?.({ category: 'Home Services' })}
          />
        </View>

        {/* Top Rated Workers */}
        <View onLayout={(e) => handleSectionLayout('workers', e.nativeEvent.layout.y)}>
          <WorkersSection
            workers={homeData.topWorkers}
            isLoading={homeData.isLoadingWorkers}
            hasActiveSubscription={homeData.hasActiveSubscription}
            onWorkerPress={handleWorkerPress}
            onSeeAll={() => onNavigateToWorkers?.()}
          />
        </View>

        {/* Top Vendors */}
        <View onLayout={(e) => handleSectionLayout('vendors', e.nativeEvent.layout.y)}>
          <VendorsSection
            vendors={homeData.topVendors}
            isLoading={homeData.isLoadingVendors}
            hasActiveSubscription={homeData.hasActiveSubscription}
            onVendorPress={handleVendorPress}
            onSeeAll={() => onNavigateToVendors?.()}
          />
        </View>

        {/* 2 BHK Rental Properties */}
        {/* <View onLayout={(e) => handleSectionLayout('properties2BHK', e.nativeEvent.layout.y)}>
          <PropertiesSection
            title="2 BHK Rentals"
            properties={homeData.properties2BHK}
            isLoading={homeData.isLoadingProperties2BHK}
            onPropertyPress={handlePropertyPress}
            onSeeAll={() => onNavigateToProperties?.()}
          />
        </View> */}

        {/* 3 BHK Properties */}
        {/* <View onLayout={(e) => handleSectionLayout('properties3BHK', e.nativeEvent.layout.y)}>
          <PropertiesSection
            title="3 BHK Rentals"
            properties={homeData.properties3BHK}
            isLoading={homeData.isLoadingProperties3BHK}
            onPropertyPress={handlePropertyPress}
            onSeeAll={() => onNavigateToProperties?.()}
          />
        </View> */}

        {/* Properties Under 10K Monthly Rent */}
        {/* <View onLayout={(e) => handleSectionLayout('propertiesUnder10K', e.nativeEvent.layout.y)}>
          <PropertiesSection
            title="Rentals Under ₹10,000"
            properties={homeData.propertiesUnder10K}
            isLoading={homeData.isLoadingPropertiesUnder10K}
            onPropertyPress={handlePropertyPress}
            onSeeAll={() => onNavigateToProperties?.()}
          />
        </View> */}

        {/* Construction Services */}
        {/* <View onLayout={(e) => handleSectionLayout('constructionServices', e.nativeEvent.layout.y)}>
          <ServicesSection
            title="Construction Services"
            services={homeData.constructionServices}
            isLoading={homeData.isLoadingConstructionServices}
            onServicePress={handleServicePress}
            onSeeAll={() => onNavigateToServices?.({ category: 'Construction Services' })}
          />
        </View> */}



        {/* Inquiry Services */}
        {/* <View onLayout={(e) => handleSectionLayout('inquiryServices', e.nativeEvent.layout.y)}>
          <ServicesSection
            title="Inquiry Services"
            services={homeData.inquiryServices}
            isLoading={homeData.isLoadingInquiryServices}
            onServicePress={handleServicePress}
            onSeeAll={() => onNavigateToServices?.({ price_type: 'inquiry' })}
          />
        </View> */}
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
            setShowServiceDetailSheet(false);
            onNavigateToBookingFlow?.(selectedService);
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
          const subcategoryName = subcategory.name.toLowerCase();
          const subcategorySlug = subcategory.slug;

          // Marketplace navigation
          if (subcategoryName === 'properties' || subcategorySlug === 'rental-properties') {
            if (onNavigateToProperties) {
              onNavigateToProperties();
            }
          } else if (subcategoryName === 'projects' || subcategorySlug === 'projects') {
            if (onNavigateToProjects) {
              onNavigateToProjects();
            }
          } else if (subcategoryName === 'workers' || subcategorySlug === 'workers') {
            if (onNavigateToWorkers) {
              onNavigateToWorkers();
            }
          } else if (subcategoryName === 'vendors' || subcategorySlug === 'vendors') {
            if (onNavigateToVendors) {
              onNavigateToVendors();
            }
          } else {
            // For Home Services and Construction Services, navigate to CategoryServicesScreen
            const isHomeOrConstruction = selectedCategory?.name.toLowerCase().includes('home service') ||
                                        selectedCategory?.name.toLowerCase().includes('construction service');

            if (isHomeOrConstruction && onNavigateToCategoryServices) {
              onNavigateToCategoryServices(subcategory);
            } else {
              // For other subcategories, navigate to services with filter
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
      />
    </View>
  );
}
