import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

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
  // Don't render if loading or empty
  if (isLoading || isEmpty) {
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
        {onSeeAll && (
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
      {children}
    </View>
  );
}
