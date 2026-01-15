import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { Category, HomepageCategoryIcon } from '../../../services';
import ImageWithSkeleton from '../../../components/ImageWithSkeleton';
import NotFoundIcon from '../../../components/icons/NotFoundIcon';

interface CategoryGridProps {
  categories: Category[];
  homepageIcons: HomepageCategoryIcon[];
  isLoading: boolean;
  onCategoryPress: (category: Category) => void;
}

const fixedCategories = [
  { slug: 'home-services', title: 'Home Service', name: 'Home Service' },
  { slug: 'construction-services', title: 'Construction Service', name: 'Construction Service' },
  { slug: 'marketplace', title: 'Marketplace', name: 'Marketplace' },
];

function CategorySkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.ease,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.5, 1],
  });

  return (
    <View className="flex-row" style={{ gap: 8 }}>
      {[1, 2, 3].map((index) => (
        <Animated.View
          key={index}
          className="flex-1 rounded-lg bg-[#F3F4F6]"
          style={{ height: 120, opacity }}>
          <View className="items-center justify-center" style={{ height: 80 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#E5E7EB',
              }}
            />
          </View>
          <View className="items-center px-2">
            <View
              style={{
                width: '70%',
                height: 12,
                borderRadius: 4,
                backgroundColor: '#E5E7EB',
              }}
            />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

export default function CategoryGrid({
  categories,
  homepageIcons,
  isLoading,
  onCategoryPress,
}: CategoryGridProps) {
  const getCategoryEntity = (slug: string): Category | null => {
    return categories.find((cat) => cat.slug === slug) || null;
  };

  const getHomepageIcon = (categoryName: string): HomepageCategoryIcon | null => {
    return (
      homepageIcons.find((icon) => icon.name.toLowerCase() === categoryName.toLowerCase()) || null
    );
  };

  return (
    <View className="px-6 pb-4 pt-4">
      <Text className="mb-4 font-bold text-xl text-[#111928] ">What are you looking for?</Text>

      {isLoading ? (
        <CategorySkeleton />
      ) : (
        <View className="flex-row" style={{ gap: 8 }}>
          {fixedCategories.map((fixedCategory, index) => {
            const categoryEntity = getCategoryEntity(fixedCategory.slug);
            const homepageIcon = getHomepageIcon(fixedCategory.name);
            const iconUrl = homepageIcon?.icon_url;
            // Check if icon is a URL (http/https)
            const isImageUrl =
              iconUrl &&
              iconUrl.trim() !== '' &&
              (iconUrl.startsWith('http://') || iconUrl.startsWith('https://'));

            return (
              <View key={fixedCategory.slug} className="flex-1">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (categoryEntity) {
                      onCategoryPress(categoryEntity);
                    } else {
                      onCategoryPress({
                        id: index + 1,
                        name: fixedCategory.title,
                        slug: fixedCategory.slug,
                        is_active: true,
                      });
                    }
                  }}
                  className="flex-1"
                  style={{ width: '100%', height: 120 }}>
                  <View className="flex-1 rounded-lg bg-[#F5F5F5]">
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
                    <View className="flex-1 justify-start px-2">
                      <Text
                        className="text-center font-medium text-sm text-[#111928]"
                        style={{ fontFamily: 'Inter-Medium' }}
                        numberOfLines={2}>
                        {categoryEntity?.name || fixedCategory.title}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
