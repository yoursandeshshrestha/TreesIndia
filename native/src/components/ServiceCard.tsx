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
  width = 200 
}: ServiceCardProps) {
  const getDisplayPrice = () => {
    if (service.price_type === 'fixed' && service.price) {
      return `Starts at ₹${service.price.toLocaleString('en-IN')}`;
    }
    return 'Inquiry';
  };

  const primaryImage = service.images && service.images.length > 0 ? service.images[0] : null;

  return (
    <TouchableOpacity
      className="mb-3"
      activeOpacity={0.7}
      onPress={onPress}
      style={{ width }}
    >
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
        }}
      >
        {primaryImage ? (
          <ImageWithSkeleton
            source={{ uri: primaryImage }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-[#F3F4F6] items-center justify-center">
            <NotFoundIcon size={64} color="#9CA3AF" />
            <Text
              className="text-sm text-[#9CA3AF] mt-2"
              style={{ fontFamily: 'Inter-Regular' }}
            >
              No Image
            </Text>
          </View>
        )}
      </View>

      {/* Details Section */}
      <View>
        {/* Service Name */}
        <Text
          className="text-sm font-semibold text-[#111928] mb-2"
          style={{ fontFamily: 'Inter-SemiBold' }}
          numberOfLines={2}
        >
          {service.name}
        </Text>

        {/* Price and Book Button */}
        <View className="flex-row items-center justify-between">
          <Text
            className="text-base font-semibold text-[#00a871] flex-1"
            style={{ fontFamily: 'Inter-SemiBold' }}
            numberOfLines={1}
          >
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
              className="bg-[#00a871] rounded-lg px-3 py-1.5 ml-2"
            >
              <Text
                className="text-xs font-semibold text-white"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                Book
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Duration (if available) */}
        {service.duration && (
          <Text
            className="text-xs text-[#6B7280] mt-1"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            {service.duration}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

