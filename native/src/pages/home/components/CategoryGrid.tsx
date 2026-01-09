import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
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
    return homepageIcons.find((icon) => icon.name.toLowerCase() === categoryName.toLowerCase()) || null;
  };

  return (
    <View className="px-6 pt-4 pb-4">
      <Text
        className="text-xl font-bold text-[#111928] mb-4 "
      >
        What are you looking for?
      </Text>

      {isLoading ? (
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
                  style={{ width: '100%', height: 120 }}
                >
                  <View className="bg-[#F5F5F5] rounded-lg flex-1">
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
                    <View className="px-2 flex-1 justify-start">
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
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
