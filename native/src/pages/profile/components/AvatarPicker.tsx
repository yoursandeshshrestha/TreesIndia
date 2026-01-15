import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import CameraIcon from '../../../components/icons/CameraIcon';

interface AvatarPickerProps {
  avatarUrl?: string | null;
  name?: string;
  isLoading?: boolean;
  onPress: () => void;
}

export default function AvatarPicker({
  avatarUrl,
  name,
  isLoading = false,
  onPress,
}: AvatarPickerProps) {
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
      className="self-center">
      <View className="relative">
        <View className="h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full border-[3px] border-[#055c3a]/20 bg-[#055c3a]/10 shadow-lg">
          {isLoading ? (
            <View className="absolute inset-0 items-center justify-center rounded-full bg-black/60">
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <Text
              className="font-semibold text-4xl text-[#055c3a]"
              style={{
                fontFamily: 'Inter-SemiBold',
                lineHeight: 48,
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}>
              {getInitials(name)}
            </Text>
          )}
        </View>
        {/* Camera Icon Button */}
        <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full bg-[#055c3a] shadow-lg">
          <CameraIcon size={20} color="#ffffff" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
