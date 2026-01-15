import React, { useEffect } from 'react';
import { Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export default function SplashScreen({ onFinish, duration = 2000 }: SplashScreenProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.ease,
    });

    // Auto finish after duration
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish, opacity]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View className="flex-1 items-center justify-center bg-white" style={containerStyle}>
      <Image
        source={require('../../assets/logo/main_logo_with_name.png')}
        className="h-[200px] w-[200px]"
        resizeMode="contain"
      />
    </Animated.View>
  );
}
