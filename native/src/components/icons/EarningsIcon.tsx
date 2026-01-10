import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface EarningsIconProps {
  size?: number;
  color?: string;
}

export default function EarningsIcon({
  size = 24,
  color = 'currentColor',
}: EarningsIconProps) {
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
      <Path
        d="M9 9H13.5C14.3284 9 15 9.67157 15 10.5C15 11.3284 14.3284 12 13.5 12H10.5C9.67157 12 9 12.6716 9 13.5C9 14.3284 9.67157 15 10.5 15H15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 7V9M12 15V17"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
