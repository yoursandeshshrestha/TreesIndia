import React from 'react';
import { TextInput, View, Text, TextInputProps, Platform } from 'react-native';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export default function TextField({
  label,
  error,
  containerClassName = '',
  ...textInputProps
}: TextFieldProps) {
  return (
    <View className={containerClassName}>
      {label && (
        <Text
          className="mb-2 font-medium text-sm text-[#111928]"
          style={{
            fontFamily: 'Inter-Medium',
            lineHeight: 18,
            ...(Platform.OS === 'android' && { includeFontPadding: false }),
          }}>
          {label}
        </Text>
      )}
      <View
        className={`rounded-lg border ${error ? 'border-[#B3261E]' : 'border-[#E5E7EB]'}`}
        style={{
          minHeight: 48,
          justifyContent: 'center',
        }}>
        <TextInput
          className="text-base text-[#111928]"
          placeholderTextColor="#9CA3AF"
          style={{
            paddingHorizontal: 16,
            paddingVertical: Platform.OS === 'ios' ? 14 : 12,
            margin: 0,
            fontSize: 16,
            lineHeight: Platform.OS === 'ios' ? 20 : 22,
            textAlignVertical: 'center',
            fontFamily: 'Inter-Regular',
            ...(Platform.OS === 'android' && {
              includeFontPadding: false,
              textAlignVertical: 'center',
            }),
          }}
          {...textInputProps}
        />
      </View>
      {error && (
        <Text
          className="mt-2 text-sm text-[#B3261E]"
          style={{
            fontFamily: 'Inter-Regular',
            lineHeight: 18,
            ...(Platform.OS === 'android' && { includeFontPadding: false }),
          }}>
          {error}
        </Text>
      )}
    </View>
  );
}
