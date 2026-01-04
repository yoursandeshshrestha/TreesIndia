import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import LockIcon from './icons/LockIcon';

interface BlurWrapperProps {
  children: React.ReactNode;
  shouldBlur: boolean;
  blurIntensity?: number;
}

export default function BlurWrapper({
  children,
  shouldBlur,
  blurIntensity = 10,
}: BlurWrapperProps) {
  if (!shouldBlur) {
    return <>{children}</>;
  }

  return (
    <View style={{ position: 'relative' }}>
      {children}
      <BlurView
        intensity={blurIntensity}
        style={[StyleSheet.absoluteFill, styles.blurView]}
        tint="light"
      />
      <View style={styles.textOverlay}>
        <View style={styles.textContainer}>
          <LockIcon size={16} color="#FFFFFF" />
          <Text style={styles.unlockText}>Subscribe</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blurView: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  textContainer: {
    backgroundColor: '#055c3a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unlockText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
