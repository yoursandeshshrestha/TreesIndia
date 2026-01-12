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
    <View className="pt-4 pb-4">
      <View className="flex-row justify-between items-center mb-4 px-6">
        <Text
          className="text-xl font-bold text-[#111928]"
          style={{ fontFamily: 'Inter-Bold' }}
        >
          {title}
        </Text>
        {onSeeAll && !isLoading && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text
              className="text-sm font-medium text-[#00a871]"
              style={{ fontFamily: 'Inter-Medium' }}
            >
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
            contentContainerStyle={{ paddingRight: 24 }}
          >
            {[1, 2].map((index) => (
              <View
                key={index}
                style={{ marginLeft: index === 1 ? 24 : 16 }}
              >
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
