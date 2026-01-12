import React, { useState, useEffect, useRef } from 'react';
import { View, Image, ImageProps, Animated, Easing } from 'react-native';

interface ImageWithSkeletonProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  skeletonColor?: string;
  className?: string;
}

export default function ImageWithSkeleton({
  source,
  skeletonColor = '#F3F4F6',
  className = '',
  style,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
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
    }
  }, [isLoading, shimmerAnim]);

  const handleLoad = () => {
    setIsLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.5, 1],
  });

  // If source is a number (local require), don't show skeleton
  if (typeof source === 'number' || (typeof source === 'object' && 'uri' in source && !source.uri)) {
    return (
      <Image
        source={source}
        className={className}
        style={style}
        onError={handleError}
        {...props}
      />
    );
  }

  return (
    <View className={`relative ${className}`} style={style}>
      {/* Skeleton Loader with Shimmer */}
      {isLoading && (
        <Animated.View
          className="absolute inset-0"
          style={{
            backgroundColor: skeletonColor,
            opacity: shimmerOpacity,
          }}
        />
      )}

      {/* Image */}
      {!hasError && (
        <Animated.View
          className="absolute inset-0"
          style={{
            opacity: isLoading ? 0 : fadeAnim,
          }}
        >
          <Image
            source={source}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </Animated.View>
      )}

      {/* Error State */}
      {hasError && (
        <View
          className="absolute inset-0 bg-[#F3F4F6] items-center justify-center"
        />
      )}
    </View>
  );
}

