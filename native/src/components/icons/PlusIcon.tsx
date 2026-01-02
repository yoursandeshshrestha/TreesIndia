import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PlusIconProps {
  size?: number;
  color?: string;
}

export default function PlusIcon({ size = 24, color = 'currentColor' }: PlusIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4V20M20 12H4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}


