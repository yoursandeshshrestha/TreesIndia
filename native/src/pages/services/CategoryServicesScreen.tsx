import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { serviceService, categoryService, type Service, type Category } from '../../services';
import ServiceCard from '../../components/ServiceCard';
import BackIcon from '../../components/icons/BackIcon';
import CategoryIcon from '../../components/icons/CategoryIcon';
import NotFoundIcon from '../../components/icons/NotFoundIcon';
import ServiceDetailBottomSheet from '../home/components/ServiceDetailBottomSheet';

interface CategoryServicesScreenProps {
  onBack: () => void;
  category: Category;
  onNavigateToSubcategory?: (category: Category) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Calculate card width: screen width - outer padding (24*2) - gap between cards (12) / 2 columns
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;

interface ServiceSection {
  title: string;
  category: Category;
  data: Service[];
}

interface ServiceSectionWithCategories extends ServiceSection {
  level4Categories: Category[];
}

export default function CategoryServicesScreen({
  onBack,
  category,
  onNavigateToSubcategory,
}: CategoryServicesScreenProps) {
  const [level3Categories, setLevel3Categories] = useState<Category[]>([]); // AC Repair, TV Repair
  const [serviceSections, setServiceSections] = useState<ServiceSectionWithCategories[]>([]);
  const [selectedLevel3Id, setSelectedLevel3Id] = useState<number | null>(null); // Selected level 3 tab
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  // Load level 3 categories (direct children of current category)
  const loadLevel3Categories = useCallback(async () => {
    try {
      const allCategories = await categoryService.getCategories();
      const categoryId = category.id || category.ID;
      const level3 = allCategories.filter(
        (cat) => cat.parent_id === categoryId && cat.is_active !== false
      );
      setLevel3Categories(level3);
      return level3;
    } catch (error) {
      setLevel3Categories([]);
      return [];
    }
  }, [category.id, category.ID]);

  // Load services grouped by level 3 categories with their level 4 children
  const loadServices = useCallback(async (isRefresh: boolean = false, level3Cats?: Category[]) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Use provided level3Cats or fall back to state
      const categoriesToUse = level3Cats !== undefined ? level3Cats : level3Categories;
      const allCategories = await categoryService.getCategories();
      const sections: ServiceSectionWithCategories[] = [];

      // Load services for each level 3 category
      for (const level3Cat of categoriesToUse) {
        const level3Id = level3Cat.id || level3Cat.ID;

        // Get level 4 categories for this level 3 category
        const allLevel4Cats = allCategories.filter(
          (cat) => cat.parent_id === level3Id && cat.is_active !== false
        );

        // Filter level 4 categories to only include those with children or services
        const level4CatsWithContent: Category[] = [];
        for (const level4Cat of allLevel4Cats) {
          const level4Id = level4Cat.id || level4Cat.ID;
          
          // Check if category has children
          const hasChildren = allCategories.some(
            (cat) => cat.parent_id === level4Id && cat.is_active !== false
          );
          
          // Check if category has services
          const servicesResponse = await serviceService.getServicesWithFilters({
            category: level4Cat.name,
            limit: 1,
          });
          const hasServices = servicesResponse.success && 
                              servicesResponse.data && 
                              servicesResponse.data.length > 0;
          
          if (hasChildren || hasServices) {
            level4CatsWithContent.push(level4Cat);
          }
        }

        // Load services for this level 3 category
        const response = await serviceService.getServicesWithFilters({
          category: level3Cat.name,
          limit: 50,
        });

        if (response.success && response.data && response.data.length > 0) {
          sections.push({
            title: level3Cat.name,
            category: level3Cat,
            data: response.data,
            level4Categories: level4CatsWithContent,
          });
        }
      }

      // Load services for current category if no level 3 categories
      if (categoriesToUse.length === 0) {
        // Get child categories of current category
        const currentCategoryId = category.id || category.ID;
        const allChildCategories = allCategories.filter(
          (cat) => cat.parent_id === currentCategoryId && cat.is_active !== false
        );

        // Filter child categories to only include those with children or services
        const childCategoriesWithContent: Category[] = [];
        for (const childCat of allChildCategories) {
          const childId = childCat.id || childCat.ID;
          
          // Check if category has children
          const hasChildren = allCategories.some(
            (cat) => cat.parent_id === childId && cat.is_active !== false
          );
          
          // Check if category has services
          const servicesResponse = await serviceService.getServicesWithFilters({
            category: childCat.name,
            limit: 1,
          });
          const hasServices = servicesResponse.success && 
                              servicesResponse.data && 
                              servicesResponse.data.length > 0;
          
          if (hasChildren || hasServices) {
            childCategoriesWithContent.push(childCat);
          }
        }

        const response = await serviceService.getServicesWithFilters({
          category: category.name,
          limit: 50,
        });

        if (response.success && response.data && response.data.length > 0) {
          sections.push({
            title: category.name,
            category: category,
            data: response.data,
            level4Categories: childCategoriesWithContent,
          });
        }
      }

      setServiceSections(sections);
    } catch (error) {
      setServiceSections([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [level3Categories, category]);

  const getCategoryIcon = (category: Category): { iconUrl?: string; hasIcon: boolean } => {
    // Use icon directly from category
    // Handle both empty strings and undefined
    if (category.icon !== undefined && category.icon !== null && category.icon.trim() !== '') {
      const isImageUrl = category.icon.startsWith('http://') ||
                        category.icon.startsWith('https://');
      if (isImageUrl) {
        return { iconUrl: category.icon, hasIcon: true };
      }
    }

    return { hasIcon: false };
  };

  useEffect(() => {
    const initializeData = async () => {
      const level3Cats = await loadLevel3Categories();
      await loadServices(false, level3Cats);
    };
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id, category.ID]);

  const handleRefresh = useCallback(async () => {
    const level3Cats = await loadLevel3Categories();
    await loadServices(true, level3Cats);
  }, [loadLevel3Categories, loadServices]);

  const handleLevel3Press = (level3Id: number | null) => {
    // Toggle selection - if already selected, deselect (show all)
    if (selectedLevel3Id === level3Id) {
      setSelectedLevel3Id(null);
    } else {
      setSelectedLevel3Id(level3Id);
    }
  };

  const handleLevel4CategoryPress = (level4Category: Category) => {
    // Navigate to the level 4 category's services
    if (onNavigateToSubcategory) {
      onNavigateToSubcategory(level4Category);
    }
  };

  const handleServicePress = (service: Service) => {
    setSelectedService(service);
    setShowDetailSheet(true);
  };

  const handleBookService = (service: Service) => {
    // TODO: Navigate to booking screen or show booking flow
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-16">
      <View className="w-20 h-20 rounded-full bg-[#F3F4F6] items-center justify-center mb-4">
        <CategoryIcon size={40} color="#9CA3AF" />
      </View>
      <Text
        className="text-xl font-semibold text-[#111928] mb-2 text-center"
        style={{ fontFamily: 'Inter-SemiBold' }}
      >
        No Services Found
      </Text>
      <Text
        className="text-sm text-[#6B7280] text-center max-w-xs"
        style={{ fontFamily: 'Inter-Regular' }}
      >
        No services available in &ldquo;{category.name}&rdquo; yet
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-[#E5E7EB]">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onBack}
            className="mr-4 p-2 -ml-2"
            activeOpacity={0.7}
          >
            <BackIcon size={24} color="#111928" />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center">
            <View className="w-10 h-10 rounded-lg bg-[#F3F4F6] items-center justify-center mr-3">
              {(() => {
                const { iconUrl, hasIcon } = getCategoryIcon(category);

                if (hasIcon && iconUrl) {
                  return (
                    <Image
                      source={{ uri: iconUrl }}
                      style={{ width: 24, height: 24 }}
                      resizeMode="contain"
                    />
                  );
                } else {
                  return <NotFoundIcon size={24} color="#9CA3AF" />;
                }
              })()}
            </View>
            <Text
              className="flex-1 text-xl font-semibold text-[#111928]"
              style={{ fontFamily: 'Inter-SemiBold' }}
              numberOfLines={1}
            >
              {category.name}
            </Text>
          </View>
        </View>
      </View>

      {/* Level 3 Category Tabs (AC Repair, TV Repair, etc.) */}
      {!loading && level3Categories.length > 0 && (
        <View className="border-b border-[#E5E7EB] bg-white">
          <View className="px-6 py-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {/* "All" option */}
              <TouchableOpacity
                onPress={() => handleLevel3Press(null)}
                activeOpacity={0.7}
              >
                <View
                  className={`rounded-xl px-5 py-2.5 ${
                    selectedLevel3Id === null ? 'bg-[#00a871]' : 'bg-white border border-[#E5E7EB]'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedLevel3Id === null ? 'text-white' : 'text-[#111928]'
                    }`}
                    style={{ fontFamily: 'Inter-Medium' }}
                  >
                    All
                  </Text>
                </View>
              </TouchableOpacity>

              {level3Categories.map((level3Cat) => {
                const level3Id = level3Cat.id || level3Cat.ID || 0;
                const isSelected = selectedLevel3Id === level3Id;

                return (
                  <TouchableOpacity
                    key={level3Id}
                    onPress={() => handleLevel3Press(level3Id)}
                    activeOpacity={0.7}
                  >
                    <View
                      className={`rounded-xl px-5 py-2.5 ${
                        isSelected ? 'bg-[#00a871]' : 'bg-white border border-[#E5E7EB]'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? 'text-white' : 'text-[#111928]'
                        }`}
                        style={{ fontFamily: 'Inter-Medium' }}
                      >
                        {level3Cat.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Services Content */}
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
      ) : serviceSections.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#00a871"
              colors={['#00a871']}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View className="pt-6">
            {serviceSections
              .map((section, originalIndex) => ({ section, originalIndex }))
              .filter(({ section }) => {
                // If no level 3 category is selected, show all sections
                if (selectedLevel3Id === null) return true;
                // Otherwise, only show the selected level 3 category's section
                const sectionId = section.category.id || section.category.ID || 0;
                return sectionId === selectedLevel3Id;
              })
              .map(({ section, originalIndex }) => (
                <View key={originalIndex} className="mb-8 px-6">
                  {/* More Categories Section */}
                  {section.level4Categories.length > 0 && (
                    <View className="mb-6">
                      <Text
                        className="text-xs font-semibold text-[#6B7280] mb-4 uppercase tracking-wide"
                        style={{ fontFamily: 'Inter-SemiBold' }}
                      >
                        More Categories Related to {section.title}
                      </Text>
                      <View className="bg-white rounded-xl py-4">
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 16 }}
                        >
                          {section.level4Categories.map((level4Cat) => {
                            const { iconUrl, hasIcon } = getCategoryIcon(level4Cat);

                            return (
                              <TouchableOpacity
                                key={level4Cat.id || level4Cat.ID}
                                onPress={() => handleLevel4CategoryPress(level4Cat)}
                                activeOpacity={0.7}
                                style={{ width: 80 }}
                              >
                                <View className="items-center">
                                  <View className="w-[80px] h-[80px] bg-[#F9FAFB] rounded-xl items-center justify-center mb-2 border border-[#E5E7EB]">
                                    {hasIcon && iconUrl ? (
                                      <Image
                                        source={{ uri: iconUrl }}
                                        style={{ width: 56, height: 56 }}
                                        resizeMode="contain"
                                      />
                                    ) : (
                                      <NotFoundIcon size={56} color="#9CA3AF" />
                                    )}
                                  </View>
                                  <Text
                                    className="text-xs font-medium text-[#111928] text-center"
                                    style={{ fontFamily: 'Inter-Medium', lineHeight: 16 }}
                                    numberOfLines={2}
                                  >
                                    {level4Cat.name}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    </View>
                  )}

                  {/* Services Section */}
                  <View>
                    <Text
                      className="text-xs font-semibold text-[#6B7280]  uppercase tracking-wide"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      {section.title} Services
                    </Text>
                    <View className="bg-white rounded-xl py-4">
                      

                      {/* Services Grid */}
                      <View className="">
                        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                          {section.data.map((service, index) => (
                            <ServiceCard
                              key={service.id?.toString() || service.ID?.toString() || index}
                              service={service}
                              onPress={() => handleServicePress(service)}
                              onBook={() => handleBookService(service)}
                              showBookButton={true}
                              width={CARD_WIDTH}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
          </View>
        </ScrollView>
      )}

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
