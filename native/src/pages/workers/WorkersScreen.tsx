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
import { workerService, type Worker, type WorkerFilters } from '../../services';
import WorkerCard from '../../components/WorkerCard';
import WorkerFilterBottomSheet from './components/WorkerFilterBottomSheet';
import WorkerDetailBottomSheet from './components/WorkerDetailBottomSheet';
import SubscriptionRequiredBottomSheet from '../../components/SubscriptionRequiredBottomSheet';
import SearchIcon from '../../components/icons/SearchIcon';
import WorkerIcon from '../../components/icons/WorkerIcon';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';

interface WorkersScreenProps {
  onBack: () => void;
  initialFilters?: WorkerFilters;
  onNavigateToSubscription?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Calculate card width: screen width - padding (24*2) - gap between cards (16) / 2 columns
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 16) / 2; // 2 columns with padding

export default function WorkersScreen({
  onBack,
  initialFilters,
  onNavigateToSubscription,
}: WorkersScreenProps) {
  const { hasActiveSubscription } = useSubscriptionStatus();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showSubscriptionSheet, setShowSubscriptionSheet] = useState(false);

  const [filters, setFilters] = useState<WorkerFilters>(initialFilters || {});
  const [searchQuery, setSearchQuery] = useState('');

  const loadWorkers = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (page === 1) {
        isRefresh ? setRefreshing(true) : setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await workerService.getWorkersWithFilters({
        ...filters,
        search: searchQuery || undefined,
        page,
        limit: 20,
      });

      if (response.success && response.data) {
        if (page === 1) {
          setWorkers(response.data.workers);
        } else {
          setWorkers((prev) => [...prev, ...response.data!.workers]);
        }

        // Check if there are more pages
        if (response.data.pagination) {
          setHasMore(response.data.pagination.page < response.data.pagination.total_pages);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      loadWorkers(1);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [filters, searchQuery]);

  const handleRefresh = () => {
    setCurrentPage(1);
    setHasMore(true);
    loadWorkers(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadWorkers(nextPage);
    }
  };

  const handleApplyFilters = (newFilters: WorkerFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setHasMore(true);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    // Only count experience filters
    if (filters.experience_min !== undefined || filters.experience_max !== undefined) count++;
    return count;
  };

  const handleWorkerPress = (worker: Worker) => {
    if (!hasActiveSubscription) {
      setShowSubscriptionSheet(true);
      return;
    }
    setSelectedWorker(worker);
    setShowDetailSheet(true);
  };

  const handleContactWorker = (worker: Worker) => {
    // Open detail sheet when contact is pressed
    handleWorkerPress(worker);
  };

  const handleSubscribePress = () => {
    setShowSubscriptionSheet(false);
    if (onNavigateToSubscription) {
      onNavigateToSubscription();
    }
  };

  const renderEmptyState = () => {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <WorkerIcon size={64} color="#D1D5DB" />
        <Text
          className="mb-2 mt-4 text-center font-semibold text-lg text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          No Workers Found
        </Text>
        <Text
          className="mb-6 text-center text-sm text-[#6B7280]"
          style={{ fontFamily: 'Inter-Regular' }}>
          {getActiveFilterCount() > 0
            ? 'Try adjusting your filters to see more results'
            : 'Check back later for new worker listings'}
        </Text>
        {getActiveFilterCount() > 0 && (
          <TouchableOpacity
            onPress={() => setFilters({})}
            className="rounded-lg bg-[#00a871] px-6 py-3"
            activeOpacity={0.7}>
            <Text
              className="font-semibold text-base text-white"
              style={{ fontFamily: 'Inter-SemiBold' }}>
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
      <View className="border-b border-[#E5E7EB] px-6 py-4">
        <View className="mb-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={onBack} className="mr-4" activeOpacity={0.7}>
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text
            className="flex-1 font-semibold text-xl text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            Workers
          </Text>
          <TouchableOpacity
            onPress={() => setShowFilterSheet(true)}
            className="flex-row items-center rounded-lg bg-[#F3F4F6] px-4 py-2"
            activeOpacity={0.7}>
            <SearchIcon size={18} color="#4B5563" />
            <Text
              className="ml-2 font-medium text-sm text-[#4B5563]"
              style={{ fontFamily: 'Inter-Medium' }}>
              Filters
            </Text>
            {getActiveFilterCount() > 0 && (
              <View className="ml-2 h-5 w-5 items-center justify-center rounded-full bg-[#00a871]">
                <Text
                  className="font-semibold text-xs text-white"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  {getActiveFilterCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="mb-3 flex-row items-center rounded-xl border border-[#E5E7EB] bg-white px-4">
          <SearchIcon size={20} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search workers..."
            placeholderTextColor="#9CA3AF"
            className="ml-3 flex-1 text-base text-[#111928]"
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
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Text className="text-xl text-[#6B7280]">×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}>
            {(filters.experience_min !== undefined || filters.experience_max !== undefined) && (
              <View className="rounded-full bg-[#00a871] px-3 py-1.5">
                <Text
                  className="font-medium text-xs text-white"
                  style={{ fontFamily: 'Inter-Medium' }}>
                  {filters.experience_min !== undefined && filters.experience_max !== undefined
                    ? `${filters.experience_min}-${filters.experience_max} years`
                    : filters.experience_min !== undefined
                      ? `${filters.experience_min}+ years`
                      : `Up to ${filters.experience_max} years`}
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
          <Text className="mt-4 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Loading workers...
          </Text>
        </View>
      ) : workers.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={workers}
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
            <WorkerCard
              worker={item}
              onPress={() => handleWorkerPress(item)}
              shouldBlur={!hasActiveSubscription}
              width={CARD_WIDTH}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00a871" />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Bottom Sheet */}
      <WorkerFilterBottomSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />

      {/* Worker Detail Bottom Sheet */}
      {selectedWorker && (
        <WorkerDetailBottomSheet
          visible={showDetailSheet}
          onClose={() => setShowDetailSheet(false)}
          worker={selectedWorker}
        />
      )}

      {/* Subscription Required Bottom Sheet */}
      <SubscriptionRequiredBottomSheet
        visible={showSubscriptionSheet}
        onClose={() => setShowSubscriptionSheet(false)}
        onSubscribe={handleSubscribePress}
        contentType="worker"
      />
    </SafeAreaView>
  );
}
