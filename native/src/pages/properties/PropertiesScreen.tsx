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
import { propertyService, type Property } from '../../services';
import PropertyCardCompact from '../../components/PropertyCardCompact';
import PropertyDetailBottomSheet from '../home/components/PropertyDetailBottomSheet';
import FilterBottomSheet, { type PropertyFilters } from './components/FilterBottomSheet';
import SearchIcon from '../../components/icons/SearchIcon';
import PropertyIcon from '../../components/icons/PropertyIcon';

interface PropertiesScreenProps {
  onBack: () => void;
  initialFilters?: PropertyFilters;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding

export default function PropertiesScreen({ onBack, initialFilters }: PropertiesScreenProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [filters, setFilters] = useState<PropertyFilters>(initialFilters || {});
  const [searchQuery, setSearchQuery] = useState('');

  const loadProperties = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (page === 1) {
        isRefresh ? setRefreshing(true) : setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await propertyService.getPropertiesWithFilters({
        ...filters,
        search: searchQuery || undefined,
        page,
        limit: 20,
      });

      if (response.success && response.data) {
        if (page === 1) {
          setProperties(response.data);
        } else {
          setProperties((prev) => [...prev, ...response.data!]);
        }

        // Check if there are more pages
        if (response.pagination) {
          setHasMore(response.pagination.page < response.pagination.total_pages);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      loadProperties(1);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [filters, searchQuery]);

  const handleRefresh = () => {
    setCurrentPage(1);
    setHasMore(true);
    loadProperties(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadProperties(nextPage);
    }
  };

  const handlePropertyPress = (property: Property) => {
    setSelectedProperty(property);
    setShowDetailSheet(true);
  };

  const handleApplyFilters = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setHasMore(true);
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).length;
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <PropertyIcon size={64} color="#D1D5DB" />
      <Text
        className="text-lg font-semibold text-[#111928] mt-4 mb-2 text-center"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        No Properties Found
      </Text>
      <Text
        className="text-sm text-[#6B7280] text-center mb-6"
        style={{ fontFamily: 'Inter-Regular' }}
      >
        {getActiveFilterCount() > 0
          ? 'Try adjusting your filters to see more results'
          : 'Check back later for new property listings'}
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
            Properties
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
            placeholder="Search properties..."
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
            {filters.listing_type && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  {filters.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                </Text>
              </View>
            )}
            {filters.property_type && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  {filters.property_type.charAt(0).toUpperCase() + filters.property_type.slice(1)}
                </Text>
              </View>
            )}
            {filters.bedrooms && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  {filters.bedrooms}+ BHK
                </Text>
              </View>
            )}
            {filters.bathrooms && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  {filters.bathrooms}+ Bath
                </Text>
              </View>
            )}
            {filters.max_price && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  Up to ₹{(filters.max_price / (filters.listing_type === 'rent' ? 1000 : 100000)).toFixed(0)}
                  {filters.listing_type === 'rent' ? 'K' : 'L'}
                </Text>
              </View>
            )}
            {filters.furnishing_status && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  {filters.furnishing_status.charAt(0).toUpperCase() + filters.furnishing_status.slice(1).replace('-', ' ')}
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
            Loading properties...
          </Text>
        </View>
      ) : properties.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 32,
          }}
          columnWrapperStyle={{
            justifyContent: 'space-between',
          }}
          renderItem={({ item }) => (
            <PropertyCardCompact
              property={item}
              onPress={() => handlePropertyPress(item)}
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

      {/* Property Detail Bottom Sheet */}
      {selectedProperty && (
        <PropertyDetailBottomSheet
          visible={showDetailSheet}
          onClose={() => setShowDetailSheet(false)}
          property={selectedProperty}
        />
      )}

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </SafeAreaView>
  );
}
