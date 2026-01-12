import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

interface CardSkeletonProps {
  width?: number;
  height?: number;
}

export default function CardSkeleton({ width = 200, height = 240 }: CardSkeletonProps) {
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
    <View
      style={{
        width,
        height,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
      }}
    >
      {/* Image placeholder */}
      <Animated.View
        style={{
          height: height * 0.6,
          backgroundColor: '#F3F4F6',
          opacity,
        }}
      />

      {/* Content placeholder */}
      <View style={{ padding: 12, gap: 8 }}>
        {/* Title placeholder */}
        <Animated.View
          style={{
            height: 16,
            backgroundColor: '#F3F4F6',
            borderRadius: 4,
            width: '80%',
            opacity,
          }}
        />

        {/* Subtitle placeholder */}
        <Animated.View
          style={{
            height: 12,
            backgroundColor: '#F3F4F6',
            borderRadius: 4,
            width: '60%',
            opacity,
          }}
        />

        {/* Price/Info placeholder */}
        <Animated.View
          style={{
            height: 14,
            backgroundColor: '#F3F4F6',
            borderRadius: 4,
            width: '40%',
            opacity,
          }}
        />
      </View>
    </View>
  );
}
