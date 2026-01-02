import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';

interface GenderSelectorProps {
  selectedGender: 'male' | 'female';
  onGenderChange: (gender: 'male' | 'female') => void;
}

export default function GenderSelector({
  selectedGender,
  onGenderChange,
}: GenderSelectorProps) {
  const GenderTab = ({
    value,
    label,
    isSelected,
  }: {
    value: 'male' | 'female';
    label: string;
    isSelected: boolean;
  }) => (
    <TouchableOpacity
      onPress={() => onGenderChange(value)}
      activeOpacity={0.7}
      className={`px-4 py-2 rounded-lg border ${
        isSelected
          ? 'bg-[#055c3a]/10 border-[#055c3a]'
          : 'bg-[#F9FAFB] border-[#E5E7EB]'
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          isSelected ? 'text-[#055c3a]' : 'text-[#6B7280]'
        }`}
        style={{
          fontFamily: isSelected ? 'Inter-Medium' : 'Inter-Regular',
          lineHeight: 18,
          ...(Platform.OS === 'android' && { includeFontPadding: false }),
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-row gap-3">
      <GenderTab
        value="male"
        label="Male"
        isSelected={selectedGender === 'male'}
      />
      <GenderTab
        value="female"
        label="Female"
        isSelected={selectedGender === 'female'}
      />
    </View>
  );
}


