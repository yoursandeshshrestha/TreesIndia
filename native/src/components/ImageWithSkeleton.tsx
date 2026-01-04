import React, { useState } from 'react';
import { View, Image, ImageProps, Animated, Easing } from 'react-native';

interface ImageWithSkeletonProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  skeletonColor?: string;
  className?: string;
}

export default function ImageWithSkeleton({
  source,
  skeletonColor = '#E5E7EB',
  className = '',
  style,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

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
      {/* Skeleton Loader */}
      {isLoading && (
        <View
          className="absolute inset-0"
          style={{
            backgroundColor: skeletonColor,
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

