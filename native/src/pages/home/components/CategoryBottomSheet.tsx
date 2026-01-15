import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Category, categoryService } from '../../../services';
import CategoryIcon from '../../../components/icons/CategoryIcon';
import NotFoundIcon from '../../../components/icons/NotFoundIcon';

interface CategoryBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  category: Category | null;
  onSelectSubcategory?: (category: Category) => void;
}

export default function CategoryBottomSheet({
  visible,
  onClose,
  category,
  onSelectSubcategory,
}: CategoryBottomSheetProps) {
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['60%'], []);

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });
      if (category) {
        loadSubcategories();
      }
    }
  }, [visible, category]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        setSubcategories([]);
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const loadSubcategories = async () => {
    if (!category) return;

    try {
      setIsLoadingSubcategories(true);

      // Check if this is a marketplace category
      const isMarketplace = category.name.toLowerCase().includes('marketplace');

      if (isMarketplace) {
        // For marketplace, show hardcoded subcategories
        const categoryId = category.id || category.ID;
        const marketplaceSubcategories: Category[] = [
          {
            id: 1001,
            ID: 1001,
            name: 'Properties',
            slug: 'rental-properties',
            description: 'Find rental properties and real estate',
            parent_id: categoryId,
            is_active: true,
          },
          {
            id: 1002,
            ID: 1002,
            name: 'Projects',
            slug: 'projects',
            description: 'Browse construction and development projects',
            parent_id: categoryId,
            is_active: true,
          },
          {
            id: 1003,
            ID: 1003,
            name: 'Vendors',
            slug: 'vendors',
            description: 'Find trusted vendors and service providers',
            parent_id: categoryId,
            is_active: true,
          },
          {
            id: 1004,
            ID: 1004,
            name: 'Workers',
            slug: 'workers',
            description: 'Connect with skilled workers',
            parent_id: categoryId,
            is_active: true,
          },
        ];
        setSubcategories(marketplaceSubcategories);
      } else {
        // For other categories, load from API
        const allCategories = await categoryService.getCategories();
        const categoryId = category.id || category.ID;
        const subs = allCategories.filter(
          (cat) => cat.parent_id === categoryId && cat.is_active !== false
        );
        setSubcategories(subs);
      }
    } catch (error) {
      setSubcategories([]);
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

  const handleSelectSubcategory = (subcategory: Category) => {
    if (onSelectSubcategory) {
      onSelectSubcategory(subcategory);
      setSubcategories([]);
      bottomSheetRef.current?.dismiss();
    }
  };

  const getCategoryIcon = (category: Category): { iconUrl?: string; hasIcon: boolean } => {
    // Use icon directly from category
    // Handle both empty strings and undefined
    if (category.icon !== undefined && category.icon !== null && category.icon.trim() !== '') {
      const isImageUrl =
        category.icon.startsWith('http://') || category.icon.startsWith('https://');
      if (isImageUrl) {
        return { iconUrl: category.icon, hasIcon: true };
      }
    }

    return { hasIcon: false };
  };

  if (!category) return null;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableDynamicSizing={false}
      backgroundStyle={{
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}>
      <View className="flex-1">
        {/* Header */}
        <View className="border-b border-[#E5E7EB] px-6 py-6">
          <Text
            className="text-center font-semibold text-lg text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            {category.name}
          </Text>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}>
          {/* Subcategories Grid */}
          {isLoadingSubcategories ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#00a871" />
              <Text className="mt-4 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                Loading...
              </Text>
            </View>
          ) : subcategories.length > 0 ? (
            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              {subcategories.map((subcategory) => {
                const { iconUrl, hasIcon } = getCategoryIcon(subcategory);

                return (
                  <TouchableOpacity
                    key={subcategory.id || subcategory.ID}
                    onPress={() => handleSelectSubcategory(subcategory)}
                    className="items-center"
                    activeOpacity={0.7}
                    style={{ width: '30%' }}>
                    <View className="mb-2 h-[70px] w-full items-center justify-center rounded-lg bg-[#F5F5F5]">
                      {hasIcon && iconUrl ? (
                        <Image
                          source={{ uri: iconUrl }}
                          style={{ width: 40, height: 40 }}
                          resizeMode="contain"
                        />
                      ) : (
                        <NotFoundIcon size={40} color="#9CA3AF" />
                      )}
                    </View>
                    <Text
                      className="text-center font-medium text-xs text-[#111928]"
                      style={{ fontFamily: 'Inter-Medium', lineHeight: 16 }}
                      numberOfLines={2}>
                      {subcategory.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View className="items-center justify-center py-8">
              <CategoryIcon size={48} color="#D1D5DB" />
              <Text
                className="mt-4 text-center text-sm text-[#6B7280]"
                style={{ fontFamily: 'Inter-Regular' }}>
                No subcategories available
              </Text>
            </View>
          )}
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}
