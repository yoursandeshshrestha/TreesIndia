import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BackIconProps {
  size?: number;
  color?: string;
}

export default function BackIcon({ size = 24, color = 'currentColor' }: BackIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}


