import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CategoryIconProps {
  size?: number;
  color?: string;
}

export default function CategoryIcon({ size = 24, color = '#000000' }: CategoryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
