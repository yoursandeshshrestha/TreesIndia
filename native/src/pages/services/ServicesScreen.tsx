import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { serviceService, type Service } from '../../services';
import ServiceCard from '../../components/ServiceCard';
import ServiceFilterBottomSheet, { type ServiceFilters } from './components/ServiceFilterBottomSheet';
import ServiceDetailBottomSheet from '../home/components/ServiceDetailBottomSheet';
import SearchIcon from '../../components/icons/SearchIcon';
import CategoryIcon from '../../components/icons/CategoryIcon';

interface ServicesScreenProps {
  onBack: () => void;
  initialFilters?: ServiceFilters;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Calculate card width: screen width - padding (24*2) - gap between cards (16) / 2 columns
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 16) / 2; // 2 columns with padding

export default function ServicesScreen({ onBack, initialFilters }: ServicesScreenProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);

  const [filters, setFilters] = useState<ServiceFilters>(initialFilters || {});
  const [searchQuery, setSearchQuery] = useState('');

  const loadServices = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (page === 1) {
        isRefresh ? setRefreshing(true) : setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await serviceService.getServicesWithFilters({
        ...filters,
        search: searchQuery || undefined,
        page,
        limit: 20,
      });

      if (response.success && response.data) {
        if (page === 1) {
          setServices(response.data);
        } else {
          setServices((prev) => [...prev, ...response.data!]);
        }

        // Check if there are more pages
        if (response.pagination) {
          setHasMore(response.pagination.page < response.pagination.total_pages);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('Subscription required')) {
        setSubscriptionRequired(true);
      } else {
        console.error('Error loading services:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      loadServices(1);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [filters, searchQuery]);

  const handleRefresh = () => {
    setCurrentPage(1);
    setHasMore(true);
    loadServices(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadServices(nextPage);
    }
  };

  const handleApplyFilters = (newFilters: ServiceFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setHasMore(true);
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).length;
  };

  const handleServicePress = (service: Service) => {
    setSelectedService(service);
    setShowDetailSheet(true);
  };

  const handleBookService = (service: Service) => {
    // TODO: Navigate to booking screen or show booking flow
  };

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(1)}K`;
    }
    return `₹${price}`;
  };

  const renderEmptyState = () => {
    if (subscriptionRequired) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">🔒</Text>
          <Text
            className="text-lg font-semibold text-[#111928] mt-4 mb-2 text-center"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            Subscription Required
          </Text>
          <Text
            className="text-sm text-[#6B7280] text-center mb-6"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Upgrade your subscription to access our complete services directory and discover all available services.
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center px-6">
        <CategoryIcon size={64} color="#D1D5DB" />
        <Text
          className="text-lg font-semibold text-[#111928] mt-4 mb-2 text-center"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          No Services Found
        </Text>
        <Text
          className="text-sm text-[#6B7280] text-center mb-6"
          style={{ fontFamily: 'Inter-Regular' }}
        >
          {getActiveFilterCount() > 0
            ? 'Try adjusting your filters to see more results'
            : 'Check back later for new service listings'}
        </Text>
        {getActiveFilterCount() > 0 && (
          <TouchableOpacity
            onPress={() => setFilters({})}
            className="bg-[#00a871] px-6 py-3 rounded-lg"
            activeOpacity={0.7}
          >
            <Text
              className="text-base font-semibold text-white"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              Clear Filters
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#00a871" />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 border-b border-[#E5E7EB]">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={onBack}
            className="mr-4"
            activeOpacity={0.7}
          >
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text
            className="flex-1 text-xl font-semibold text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            Services
          </Text>
          <TouchableOpacity
            onPress={() => setShowFilterSheet(true)}
            className="flex-row items-center bg-[#F3F4F6] px-4 py-2 rounded-lg"
            activeOpacity={0.7}
          >
            <SearchIcon size={18} color="#4B5563" />
            <Text
              className="text-sm font-medium text-[#4B5563] ml-2"
              style={{ fontFamily: 'Inter-Medium' }}
            >
              Filters
            </Text>
            {getActiveFilterCount() > 0 && (
              <View className="ml-2 w-5 h-5 bg-[#00a871] rounded-full items-center justify-center">
                <Text
                  className="text-xs font-semibold text-white"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  {getActiveFilterCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="bg-white rounded-xl border border-[#E5E7EB] flex-row items-center px-4 mb-3">
          <SearchIcon size={20} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search services..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-base text-[#111928]"
            style={{
              fontFamily: 'Inter-Regular',
              paddingVertical: Platform.OS === 'ios' ? 12 : 10,
              margin: 0,
              fontSize: 16,
              lineHeight: Platform.OS === 'ios' ? 20 : 22,
              textAlignVertical: 'center',
              ...(Platform.OS === 'android' && {
                includeFontPadding: false,
                textAlignVertical: 'center',
              }),
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              activeOpacity={0.7}
            >
              <Text className="text-xl text-[#6B7280]">×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {filters.price_type && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  {filters.price_type === 'fixed' ? 'Fixed Price' : 'Inquiry Based'}
                </Text>
              </View>
            )}
            {filters.price_min && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  From {formatPrice(filters.price_min)}
                </Text>
              </View>
            )}
            {filters.price_max && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  Up to {formatPrice(filters.price_max)}
                </Text>
              </View>
            )}
            {filters.category && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  {filters.category}
                </Text>
              </View>
            )}
            {filters.subcategory && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  {filters.subcategory}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00a871" />
          <Text
            className="text-sm text-[#6B7280] mt-4"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Loading services...
          </Text>
        </View>
      ) : services.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id?.toString() || item.ID?.toString() || '0'}
          numColumns={2}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 32,
          }}
          columnWrapperStyle={{
            justifyContent: 'space-between',
          }}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onPress={() => handleServicePress(item)}
              onBook={() => handleBookService(item)}
              showBookButton={true}
              width={CARD_WIDTH}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#00a871"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Bottom Sheet */}
      <ServiceFilterBottomSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />

      {/* Service Detail Bottom Sheet */}
      {selectedService && (
        <ServiceDetailBottomSheet
          visible={showDetailSheet}
          onClose={() => setShowDetailSheet(false)}
          service={selectedService}
          onBook={() => handleBookService(selectedService)}
        />
      )}
    </SafeAreaView>
  );
}
