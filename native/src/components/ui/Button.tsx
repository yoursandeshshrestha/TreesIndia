import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'solid' | 'outline';
  className?: string;
}

export default function Button({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'solid',
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const handlePress = () => {
    try {
      const result = onPress();
      if (result instanceof Promise) {
        result.catch((error) => {
          // Error handling
        });
      }
    } catch (error) {
      // Error handling
    }
  };

  const baseClasses = 'rounded-lg flex-row items-center justify-center';
  const variantClasses =
    variant === 'solid'
      ? isDisabled
        ? 'bg-[#055c3a] opacity-30'
        : 'bg-[#055c3a]'
      : isDisabled
        ? 'border border-[#055c3a] opacity-30'
        : 'border border-[#055c3a] bg-transparent';

  const textColor = variant === 'solid' ? '#ffffff' : '#055c3a';

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={{ minHeight: 48 }}
      activeOpacity={0.8}>
      {isLoading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text
          style={{
            color: textColor,
            fontSize: 16,
            lineHeight: 22,
            textAlignVertical: 'center',
            ...(Platform.OS === 'android' && { includeFontPadding: false }),
          }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
