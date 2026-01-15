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
import { projectService, type Project } from '../../services';
import ProjectCard from '../../components/ProjectCard';
import ProjectDetailBottomSheet from '../home/components/ProjectDetailBottomSheet';
import ProjectFilterBottomSheet, { type ProjectFilters } from './components/ProjectFilterBottomSheet';
import SubscriptionRequiredBottomSheet from '../../components/SubscriptionRequiredBottomSheet';
import SearchIcon from '../../components/icons/SearchIcon';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';

interface ProjectsScreenProps {
  onBack: () => void;
  initialFilters?: ProjectFilters;
  onNavigateToSubscription?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding

export default function ProjectsScreen({ onBack, initialFilters, onNavigateToSubscription }: ProjectsScreenProps) {
  const { hasActiveSubscription } = useSubscriptionStatus();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showSubscriptionSheet, setShowSubscriptionSheet] = useState(false);

  const [filters, setFilters] = useState<ProjectFilters>(initialFilters || {});
  const [searchQuery, setSearchQuery] = useState('');

  const loadProjects = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (page === 1) {
        isRefresh ? setRefreshing(true) : setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await projectService.getProjectsWithFilters({
        ...filters,
        search: searchQuery || undefined,
        page,
        limit: 20,
      });

      if (response.success && response.data) {
        // Service now returns: { projects: [...], pagination: {...}, user_subscription: {...} }
        const projectsArray = response.data.projects || [];

        if (page === 1) {
          setProjects(projectsArray);
        } else {
          setProjects((prev) => [...prev, ...projectsArray]);
        }

        // Check if there are more pages
        if (response.data.pagination) {
          setHasMore(response.data.pagination.page < response.data.pagination.total_pages);
        } else {
          setHasMore(false);
        }
      } else {
        // If no data, set empty array
        if (page === 1) {
          setProjects([]);
        }
        setHasMore(false);
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
      loadProjects(1);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [filters, searchQuery]);

  const handleRefresh = () => {
    setCurrentPage(1);
    setHasMore(true);
    loadProjects(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadProjects(nextPage);
    }
  };

  const handleProjectPress = (project: Project) => {
    if (!hasActiveSubscription) {
      setShowSubscriptionSheet(true);
      return;
    }
    setSelectedProject(project);
    setShowDetailSheet(true);
  };

  const handleSubscribePress = () => {
    setShowSubscriptionSheet(false);
    if (onNavigateToSubscription) {
      onNavigateToSubscription();
    }
  };

  const handleApplyFilters = (newFilters: ProjectFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setHasMore(true);
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).length;
  };

  const getProjectTypeLabel = (type: string) => {
    switch (type) {
      case 'residential':
        return 'Residential';
      case 'commercial':
        return 'Commercial';
      case 'infrastructure':
        return 'Infrastructure';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on_going':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      case 'starting_soon':
        return 'Starting Soon';
      case 'on_hold':
        return 'On Hold';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const renderEmptyState = () => {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-6xl mb-4">🏗️</Text>
        <Text
          className="text-lg font-semibold text-[#111928] mt-4 mb-2 text-center"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          No Projects Found
        </Text>
        <Text
          className="text-sm text-[#6B7280] text-center mb-6"
          style={{ fontFamily: 'Inter-Regular' }}
        >
          {getActiveFilterCount() > 0
            ? 'Try adjusting your filters to see more results'
            : 'Check back later for new project listings'}
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
            Projects
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
            placeholder="Search projects..."
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
            {filters.project_type && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  {getProjectTypeLabel(filters.project_type)}
                </Text>
              </View>
            )}
            {filters.status && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  {getStatusLabel(filters.status)}
                </Text>
              </View>
            )}
            {filters.state && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  {filters.state}
                </Text>
              </View>
            )}
            {filters.city && (
              <View className="bg-[#00a871] px-3 py-1.5 rounded-full">
                <Text
                  className="text-xs font-medium text-white"
                  style={{ fontFamily: 'Inter-Medium' }}
                >
                  {filters.city}
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
            Loading projects...
          </Text>
        </View>
      ) : projects.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={projects}
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
            <ProjectCard
              project={item}
              onPress={() => handleProjectPress(item)}
              shouldBlur={!hasActiveSubscription}
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

      {/* Project Detail Bottom Sheet */}
      {selectedProject && (
        <ProjectDetailBottomSheet
          visible={showDetailSheet}
          onClose={() => setShowDetailSheet(false)}
          project={selectedProject}
        />
      )}

      {/* Filter Bottom Sheet */}
      <ProjectFilterBottomSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />

      {/* Subscription Required Bottom Sheet */}
      <SubscriptionRequiredBottomSheet
        visible={showSubscriptionSheet}
        onClose={() => setShowSubscriptionSheet(false)}
        onSubscribe={handleSubscribePress}
        contentType="project"
      />
    </SafeAreaView>
  );
}
