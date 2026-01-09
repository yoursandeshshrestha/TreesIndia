import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface WorkIconProps {
  size?: number;
  color?: string;
}

export default function WorkIcon({ size = 24, color = 'currentColor' }: WorkIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 12V17C20 19.2091 18.2091 21 16 21H8C5.79086 21 4 19.2091 4 17V12C4 9.79086 5.79086 8 8 8H16C18.2091 8 20 9.79086 20 12Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 12L8 12.01M16 12L16 12.01"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 8V21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
