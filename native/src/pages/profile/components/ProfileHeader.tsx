import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { AuthUser } from '../../../types/auth';

interface ProfileHeaderProps {
  user: AuthUser | null;
  onEditPress?: () => void;
}

export default function ProfileHeader({ user, onEditPress }: ProfileHeaderProps) {
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserTypeBadge = (userType: string) => {
    if (userType !== 'worker' && userType !== 'broker') {
      return null;
    }

    const isWorker = userType === 'worker';
    const backgroundColor = isWorker ? '#E3F2FD' : '#D1FAE5';
    const textColor = isWorker ? '#1565C0' : '#055c3a';

    return (
      <View
        className="px-3 py-1 rounded-xl"
        style={{ backgroundColor }}
      >
        <Text
          className="text-[10px] font-semibold tracking-wide"
          style={{ color: textColor, fontFamily: 'Inter-SemiBold' }}
        >
          {userType.toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={onEditPress}
      activeOpacity={0.7}
      className="flex-row items-center"
    >
      {/* Avatar - Larger Airbnb Style */}
      <View className="w-20 h-20 rounded-full bg-[#00a871] items-center justify-center overflow-hidden">
        {user?.avatar && user.avatar.trim() !== '' ? (
          <Image
            source={{ uri: user.avatar }}
            className="w-full h-full"
            resizeMode="cover"
            onError={() => {
              // If image fails to load, it will fall back to initials
            }}
          />
        ) : user?.name ? (
          <Text
            className="text-white text-2xl font-semibold"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            {getInitials(user.name)}
          </Text>
        ) : (
          <Text
            className="text-white text-2xl font-semibold"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            U
          </Text>
        )}
      </View>

      <View className="ml-5 flex-1">
        {user?.name && (
          <Text
            className="text-2xl font-semibold text-[#111928] mb-1"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            {user.name}
          </Text>
        )}
        {user?.phone && (
          <Text
            className="text-base text-[#6B7280]"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            {user.phone}
          </Text>
        )}
        {user?.user_type && getUserTypeBadge(user.user_type) && (
          <View className="mt-3">{getUserTypeBadge(user.user_type)}</View>
        )}
      </View>
    </TouchableOpacity>
  );
}

