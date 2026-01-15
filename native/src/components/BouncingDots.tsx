import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface BouncingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizeMap = {
  sm: 4,
  md: 8,
  lg: 12,
};

export default function BouncingDots({
  size = 'md',
  color = '#00a871',
  className = '',
}: BouncingDotsProps) {
  const dotSize = sizeMap[size];

  const translateY1 = useSharedValue(0);
  const translateY2 = useSharedValue(0);
  const translateY3 = useSharedValue(0);

  useEffect(() => {
    translateY1.value = withDelay(
      0,
      withRepeat(
        withTiming(-8, {
          duration: 600,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );

    translateY2.value = withDelay(
      200,
      withRepeat(
        withTiming(-8, {
          duration: 600,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );

    translateY3.value = withDelay(
      400,
      withRepeat(
        withTiming(-8, {
          duration: 600,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );
  }, [translateY1, translateY2, translateY3]);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY1.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY2.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY3.value }],
  }));

  return (
    <View className={`flex-row items-center space-x-1 ${className}`}>
      <Animated.View
        style={[
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            borderRadius: dotSize / 2,
          },
          dot1Style,
        ]}
      />
      <Animated.View
        style={[
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            borderRadius: dotSize / 2,
          },
          dot2Style,
        ]}
      />
      <Animated.View
        style={[
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            borderRadius: dotSize / 2,
          },
          dot3Style,
        ]}
      />
    </View>
  );
}
