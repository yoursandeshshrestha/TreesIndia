import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { type Property } from '../services';
import LocationIcon from './icons/LocationIcon';
import NotFoundIcon from './icons/NotFoundIcon';
import ImageWithSkeleton from './ImageWithSkeleton';

interface PropertyCardCompactProps {
  property: Property;
  onPress?: () => void;
  width?: number;
}

export default function PropertyCardCompact({
  property,
  onPress,
  width = 200,
}: PropertyCardCompactProps) {
  const getDisplayPrice = () => {
    if (property.listing_type === 'sale' && property.sale_price) {
      return `₹${property.sale_price.toLocaleString('en-IN')}`;
    } else if (property.listing_type === 'rent' && property.monthly_rent) {
      return `₹${property.monthly_rent.toLocaleString('en-IN')}`;
    }
    return 'Price not available';
  };

  const getDisplayLocation = () => {
    if (property.city && property.state) {
      return `${property.city}, ${property.state}`;
    }
    return property.city || property.state || 'Location not available';
  };

  const primaryImage =
    property.images && Array.isArray(property.images) && property.images.length > 0
      ? property.images[0]
      : null;

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
        {/* Property Name */}
        <Text
          className="mb-1 font-semibold text-sm text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}
          numberOfLines={2}>
          {property.title}
        </Text>

        {/* Location */}
        <View className="mb-2 flex-row items-center">
          <LocationIcon size={12} color="#6B7280" />
          <Text
            className="ml-1 text-xs text-[#6B7280]"
            style={{ fontFamily: 'Inter-Regular' }}
            numberOfLines={1}>
            {getDisplayLocation()}
          </Text>
        </View>

        {/* Price */}
        <Text
          className="font-semibold text-base text-[#00a871]"
          style={{ fontFamily: 'Inter-SemiBold' }}
          numberOfLines={1}>
          {getDisplayPrice()}
          {property.listing_type === 'rent' && (
            <Text className="text-xs text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
              {' /month'}
            </Text>
          )}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
