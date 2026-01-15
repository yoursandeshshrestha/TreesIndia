import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { type Service } from '../services';
import NotFoundIcon from './icons/NotFoundIcon';
import ImageWithSkeleton from './ImageWithSkeleton';

interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
  onBook?: () => void;
  showBookButton?: boolean;
  width?: number;
}

export default function ServiceCard({
  service,
  onPress,
  onBook,
  showBookButton = true,
  width = 200,
}: ServiceCardProps) {
  const getDisplayPrice = () => {
    if (service.price_type === 'fixed' && service.price) {
      return `Starts at ₹${service.price.toLocaleString('en-IN')}`;
    }
    return 'Inquiry';
  };

  const primaryImage = service.images && service.images.length > 0 ? service.images[0] : null;

  return (
    <TouchableOpacity className="mb-3" activeOpacity={0.7} onPress={onPress} style={{ width }}>
      {/* Image Section */}
      <View
        className="relative mb-2"
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
        {primaryImage ? (
          <ImageWithSkeleton
            source={{ uri: primaryImage }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-[#F3F4F6]">
            <NotFoundIcon size={64} color="#9CA3AF" />
            <Text className="mt-2 text-sm text-[#9CA3AF]" style={{ fontFamily: 'Inter-Regular' }}>
              No Image
            </Text>
          </View>
        )}
      </View>

      {/* Details Section */}
      <View>
        {/* Service Name */}
        <Text
          className="mb-2 font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}
          numberOfLines={2}>
          {service.name}
        </Text>

        {/* Price and Book Button */}
        <View className="flex-row items-center justify-between">
          <Text
            className="flex-1 font-semibold text-base text-[#00a871]"
            style={{ fontFamily: 'Inter-SemiBold' }}
            numberOfLines={1}>
            {getDisplayPrice()}
          </Text>
          {showBookButton && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                if (onBook) {
                  onBook();
                }
              }}
              activeOpacity={0.7}
              className="ml-2 rounded-lg bg-[#00a871] px-3 py-1.5">
              <Text
                className="font-semibold text-xs text-white"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Book
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Duration (if available) */}
        {service.duration && (
          <Text className="mt-1 text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            {service.duration}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
