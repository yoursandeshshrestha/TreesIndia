import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  ActivityIndicator,
  Image,
} from 'react-native';
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
  const [isClosing, setIsClosing] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible && category) {
      loadSubcategories();

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, category]);

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
      console.error('Failed to load subcategories:', error);
      setSubcategories([]);
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 500,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      setIsClosing(false);
      setSubcategories([]);
    });
  };

  const handleSelectSubcategory = (subcategory: Category) => {
    if (onSelectSubcategory) {
      onSelectSubcategory(subcategory);
      handleClose();
    }
  };

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

  if (!visible || !category) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View className="flex-1">
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: overlayOpacity,
          }}
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            minHeight: '50%',
            maxHeight: '70%',
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY }],
          }}
        >
          <SafeAreaView edges={['bottom']} className="flex-1">
            {/* Drag Handle */}
            <View className="items-center pt-3 pb-2">
              <View className="w-12 h-1 bg-[#D1D5DB] rounded-full" />
            </View>

            {/* Header */}
            <View className="px-6 py-4">
              <Text
                className="text-lg font-semibold text-[#111928] text-center"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                {category.name}
              </Text>
            </View>

            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Subcategories Grid */}
              {isLoadingSubcategories ? (
                <View className="items-center justify-center py-12">
                  <ActivityIndicator size="large" color="#00a871" />
                  <Text
                    className="text-sm text-[#6B7280] mt-4"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
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
                        style={{ width: '30%' }}
                      >
                        <View className="w-full h-[70px] bg-[#F5F5F5] rounded-lg items-center justify-center mb-2">
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
                          className="text-xs font-medium text-[#111928] text-center"
                          style={{ fontFamily: 'Inter-Medium', lineHeight: 16 }}
                          numberOfLines={2}
                        >
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
                    className="text-sm text-[#6B7280] text-center mt-4"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
                    No subcategories available
                  </Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
