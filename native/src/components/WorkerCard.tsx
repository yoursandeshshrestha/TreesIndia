import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { type Worker } from '../services';
import NotFoundIcon from './icons/NotFoundIcon';
import LocationIcon from './icons/LocationIcon';
import BlurWrapper from './BlurWrapper';
import ImageWithSkeleton from './ImageWithSkeleton';

interface WorkerCardProps {
  worker: Worker;
  onPress?: () => void;
  width?: number;
  shouldBlur?: boolean;
}

export default function WorkerCard({
  worker,
  onPress,
  width = 200,
  shouldBlur = false,
}: WorkerCardProps) {
  const getExperienceText = () => {
    const years = worker.experience_years;
    if (years === 1) {
      return '1 year exp.';
    }
    return `${years} years exp.`;
  };

  const getTopSkills = () => {
    if (!worker.skills || worker.skills.length === 0) {
      return 'No skills listed';
    }
    if (worker.skills.length <= 2) {
      return worker.skills.join(', ');
    }
    return `${worker.skills.slice(0, 2).join(', ')} +${worker.skills.length - 2}`;
  };

  const getLocation = () => {
    if (worker.address?.city && worker.address?.state) {
      return `${worker.address.city}, ${worker.address.state}`;
    }
    if (worker.address?.city) {
      return worker.address.city;
    }
    return 'Location not specified';
  };

  return (
    <TouchableOpacity
      className="mb-3"
      activeOpacity={0.7}
      onPress={onPress}
      style={{ width, flexShrink: 1 }}>
      {/* Image Section */}
      <BlurWrapper shouldBlur={shouldBlur}>
        <View
          className="relative mb-4"
          style={{
            height: 140,
            borderRadius: 20,
            overflow: 'hidden',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
              },
              android: {
                elevation: 8,
              },
            }),
          }}>
          {worker.profile_pic ? (
            <ImageWithSkeleton
              source={{ uri: worker.profile_pic }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-[#F3F4F6]">
              <NotFoundIcon size={64} color="#9CA3AF" />
              <Text className="mt-2 text-sm text-[#9CA3AF]" style={{ fontFamily: 'Inter-Regular' }}>
                No Photo
              </Text>
            </View>
          )}

          {/* Experience Badge - Top Left */}
          <View className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1">
            <Text
              className="font-semibold text-xs text-[#111928]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              {getExperienceText()}
            </Text>
          </View>

          {/* Verified Badge */}
          {worker.is_verified && (
            <View
              className="absolute right-2 top-2 flex-row items-center rounded-full bg-[#00a871] px-2 py-1"
              style={{ gap: 4 }}>
              <Text className="text-xs text-white">✓</Text>
              <Text
                className="font-semibold text-xs text-white"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Verified
              </Text>
            </View>
          )}
        </View>
      </BlurWrapper>

      {/* Details Section */}
      {shouldBlur ? (
        <View style={{ paddingHorizontal: 8 }}>
          <View
            style={{
              height: 16,
              backgroundColor: '#E5E7EB',
              borderRadius: 4,
              marginBottom: 8,
              width: '80%',
            }}
          />
          <View
            style={{
              height: 12,
              backgroundColor: '#F3F4F6',
              borderRadius: 4,
              marginBottom: 8,
              width: '60%',
            }}
          />
          <View style={{ height: 12, backgroundColor: '#F3F4F6', borderRadius: 4, width: '40%' }} />
        </View>
      ) : (
        <View>
          {/* Worker Name */}
          <Text
            className="mb-1 font-semibold text-sm text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}
            numberOfLines={1}>
            {worker.name || 'Unknown Worker'}
          </Text>

          {/* Rating */}
          {worker.rating !== undefined && worker.rating > 0 && (
            <View className="mb-2 flex-row items-center" style={{ gap: 4 }}>
              <Text className="text-xs">⭐</Text>
              <Text
                className="font-medium text-xs text-[#111928]"
                style={{ fontFamily: 'Inter-Medium' }}>
                {worker.rating.toFixed(1)}
              </Text>
            </View>
          )}

          {/* Location */}
          <View className="mb-2 flex-row items-center">
            <LocationIcon size={12} color="#6B7280" />
            <Text
              className="ml-1 text-xs text-[#6B7280]"
              style={{ fontFamily: 'Inter-Regular' }}
              numberOfLines={1}>
              {getLocation()}
            </Text>
          </View>

          {/* Skills - At Last */}
          <Text
            className="text-xs text-[#374151]"
            style={{ fontFamily: 'Inter-Regular' }}
            numberOfLines={2}>
            {getTopSkills()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
