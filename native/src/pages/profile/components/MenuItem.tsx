import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface MenuItemProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  onPress: () => void;
  showDivider?: boolean;
}

export default function MenuItem({
  icon: Icon,
  label,
  onPress,
  showDivider = true,
}: MenuItemProps) {
  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.6}
        className="py-4 flex-row items-center"
      >
        <View className="w-6 h-6 items-center justify-center">
          <Icon size={22} color="#111928" />
        </View>
        <Text
          className="flex-1 ml-4 text-base text-[#111928]"
          style={{
            fontFamily: 'Inter-Regular',
            lineHeight: 22,
            ...(Platform.OS === 'android' && { includeFontPadding: false }),
          }}
        >
          {label}
        </Text>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 18L15 12L9 6"
            stroke="#6B7280"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>
      {showDivider && (
        <View className="h-px bg-[#E5E7EB] ml-10" />
      )}
    </>
  );
}

