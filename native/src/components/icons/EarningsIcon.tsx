import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface EarningsIconProps {
  size?: number;
  color?: string;
}

export default function EarningsIcon({ size = 24, color = 'currentColor' }: EarningsIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Rupee symbol (₹) from @native/assets/icons/common/rupee.svg */}
      <Path
        d="M9 7.5H10.5C11.8807 7.5 13 8.61929 13 10C13 11.3807 11.8807 12.5 10.5 12.5H9L14.25 17.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 7.5H15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 10H15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
