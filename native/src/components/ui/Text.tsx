import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

interface TextProps extends RNTextProps {
  className?: string;
  variant?: 'regular' | 'medium' | 'semibold' | 'bold';
}

const fontFamilyMap = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};

export default function Text({
  className = '',
  variant = 'regular',
  style,
  ...props
}: TextProps) {
  return (
    <RNText
      className={className}
      style={[{ fontFamily: fontFamilyMap[variant] }, style]}
      {...props}
    />
  );
}

