import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CancelIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function CancelIcon({
  size = 24,
  color = '#000000',
  strokeWidth = 1.5,
}: CancelIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085" />
    </Svg>
  );
}
