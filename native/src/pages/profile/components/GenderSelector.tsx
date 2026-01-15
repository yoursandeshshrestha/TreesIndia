import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';

interface GenderSelectorProps {
  selectedGender: 'male' | 'female';
  onGenderChange: (gender: 'male' | 'female') => void;
}

export default function GenderSelector({ selectedGender, onGenderChange }: GenderSelectorProps) {
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
      className={`rounded-lg border px-4 py-2 ${
        isSelected ? 'border-[#055c3a] bg-[#055c3a]/10' : 'border-[#E5E7EB] bg-[#F9FAFB]'
      }`}>
      <Text
        className={`font-medium text-sm ${isSelected ? 'text-[#055c3a]' : 'text-[#6B7280]'}`}
        style={{
          fontFamily: isSelected ? 'Inter-Medium' : 'Inter-Regular',
          lineHeight: 18,
          ...(Platform.OS === 'android' && { includeFontPadding: false }),
        }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-row gap-3">
      <GenderTab value="male" label="Male" isSelected={selectedGender === 'male'} />
      <GenderTab value="female" label="Female" isSelected={selectedGender === 'female'} />
    </View>
  );
}
