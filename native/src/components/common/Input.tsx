import React from 'react';
import { View, Text, TextInput, TextInputProps, Platform } from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  required?: boolean;
}

/**
 * Production-ready Input component with proper vertical centering and text cutoff prevention
 * 
 * Features:
 * - Proper vertical text centering on iOS and Android
 * - Prevents text cutoff for descenders (g, y, p, q)
 * - Error state styling
 * - Label support with required indicator
 * - Consistent 48px height
 * - Platform-specific optimizations
 */
export default function Input({
  label,
  error,
  containerClassName = '',
  required = false,
  style,
  ...textInputProps
}: InputProps) {
  const hasError = !!error;
  const borderColor = hasError ? '#B3261E' : '#E5E7EB';

  return (
    <View className={containerClassName}>
      {label && (
        <Text
          className="text-sm font-medium text-[#111928] mb-2"
          style={{ fontFamily: 'Inter-Medium' }}
        >
          {label}
          {required && <Text className="text-[#B3261E]"> *</Text>}
        </Text>
      )}
      
      <View
        className="border rounded-lg"
        style={{
          minHeight: 48,
          borderColor,
          borderWidth: 1,
          justifyContent: 'center',
          alignSelf: 'stretch',
        }}
      >
        <TextInput
          className="text-base text-[#111928]"
          placeholderTextColor="#9CA3AF"
          editable={textInputProps.editable !== false}
          style={[
            {
              paddingHorizontal: 16,
              paddingVertical: Platform.OS === 'ios' ? 14 : 12,
              margin: 0,
              fontSize: 16,
              lineHeight: Platform.OS === 'ios' ? 20 : 22,
              textAlignVertical: 'center',
              flex: 1,
              // Using system default font instead of Inter to prevent text cutoff
              ...(Platform.OS === 'android' && {
                includeFontPadding: false,
                textAlignVertical: 'center',
              }),
            },
            style,
          ]}
          {...textInputProps}
        />
      </View>
      
      {hasError && (
        <Text
          className="text-sm text-[#B3261E] mt-2"
          style={{ fontFamily: 'Inter-Regular' }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
