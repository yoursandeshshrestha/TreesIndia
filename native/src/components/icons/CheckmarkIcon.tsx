import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CheckmarkIconProps {
  size?: number;
  color?: string;
}

export default function CheckmarkIcon({ size = 24, color = 'currentColor' }: CheckmarkIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12.6111L8.92308 17.5L20 6.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
