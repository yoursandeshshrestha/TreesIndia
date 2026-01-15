import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, Easing } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_ASPECT_RATIO = 16 / 9;
const BANNER_HEIGHT = SCREEN_WIDTH / BANNER_ASPECT_RATIO;

export default function BannerSkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.ease,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.5, 1],
  });

  return (
    <View className="pb-4 pt-4" style={{ backgroundColor: 'white' }}>
      <Animated.View
        style={{
          height: BANNER_HEIGHT,
          backgroundColor: '#F3F4F6',
          overflow: 'hidden',
          opacity,
        }}
      />

      {/* Page Indicators skeleton */}
      <View className="mt-3 flex-row justify-center" style={{ gap: 6 }}>
        {[1, 2, 3].map((index) => (
          <Animated.View
            key={index}
            style={{
              width: index === 1 ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#E5E7EB',
              opacity: opacity.interpolate({
                inputRange: [0.5, 1],
                outputRange: [0.5, 1],
              }),
            }}
          />
        ))}
      </View>
    </View>
  );
}
