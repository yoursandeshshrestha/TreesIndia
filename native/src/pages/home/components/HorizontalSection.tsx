import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import CardSkeleton from './CardSkeleton';

interface HorizontalSectionProps {
  title: string;
  onSeeAll?: () => void;
  isLoading?: boolean;
  isEmpty?: boolean;
  children: React.ReactNode;
}

export default function HorizontalSection({
  title,
  onSeeAll,
  isLoading = false,
  isEmpty = false,
  children,
}: HorizontalSectionProps) {
  // Don't render if empty and not loading
  if (isEmpty && !isLoading) {
    return null;
  }

  return (
    <View className="pb-4 pt-4">
      <View className="mb-4 flex-row items-center justify-between px-6">
        <Text className="font-bold text-xl text-[#111928]" style={{ fontFamily: 'Inter-Bold' }}>
          {title}
        </Text>
        {onSeeAll && !isLoading && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text
              className="font-medium text-sm text-[#00a871]"
              style={{ fontFamily: 'Inter-Medium' }}>
              See all
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={{ height: 240 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24 }}>
            {[1, 2].map((index) => (
              <View key={index} style={{ marginLeft: index === 1 ? 24 : 16 }}>
                <CardSkeleton width={200} height={240} />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        children
      )}
    </View>
  );
}
