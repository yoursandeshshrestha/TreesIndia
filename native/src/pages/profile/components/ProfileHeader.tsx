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
    // Only show badge for broker (worker badge is now in dedicated section)
    if (userType !== 'broker') {
      return null;
    }

    return (
      <View className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg shadow-sm" style={{ backgroundColor: '#047857' }}>
        <View className="w-2 h-2 rounded-full bg-white" />
        <Text
          className="text-xs font-bold tracking-wide text-white"
          style={{ fontFamily: 'Inter-Bold' }}
        >
          BROKER
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
            key={user.avatar}
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
        <View className="flex-row items-center gap-3 mb-1">
          {user?.name && (
            <Text
              className="text-2xl font-semibold text-[#111928]"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              {user.name}
            </Text>
          )}
        </View>
        {user?.phone && (
          <Text
            className="text-base text-[#6B7280] mb-2"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            {user.phone}
          </Text>
        )}
        {user?.user_type && getUserTypeBadge(user.user_type) && (
          <View className="mt-1">{getUserTypeBadge(user.user_type)}</View>
        )}
      </View>
    </TouchableOpacity>
  );
}

