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
      className="self-center"
    >
      <View className="relative">
        <View className="w-[120px] h-[120px] rounded-full border-[3px] border-[#055c3a]/20 items-center justify-center overflow-hidden bg-[#055c3a]/10 shadow-lg">
          {isLoading ? (
            <View className="absolute inset-0 bg-black/60 items-center justify-center rounded-full">
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text
              className="text-[#055c3a] text-4xl font-semibold"
              style={{
                fontFamily: 'Inter-SemiBold',
                lineHeight: 48,
                ...(Platform.OS === 'android' && { includeFontPadding: false }),
              }}
            >
              {getInitials(name)}
            </Text>
          )}
        </View>
        {/* Camera Icon Button */}
        <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#055c3a] items-center justify-center shadow-lg">
          <CameraIcon size={20} color="#ffffff" />
        </View>
      </View>
    </TouchableOpacity>
  );
}


