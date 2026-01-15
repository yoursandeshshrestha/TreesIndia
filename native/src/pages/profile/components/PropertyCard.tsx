import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { type Property } from '../../../services';
import LocationIcon from '../../../components/icons/LocationIcon';
import BedIcon from '../../../components/icons/BedIcon';
import BathIcon from '../../../components/icons/BathIcon';
import SqftIcon from '../../../components/icons/SqftIcon';
import NotFoundIcon from '../../../components/icons/NotFoundIcon';
import ImageWithSkeleton from '../../../components/ImageWithSkeleton';

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export default function PropertyCard({
  property,
  onPress,
  onDelete,
  isDeleting,
}: PropertyCardProps) {
  const getDisplayPrice = () => {
    if (property.listing_type === 'sale' && property.sale_price) {
      return `₹${property.sale_price.toLocaleString('en-IN')}`;
    } else if (property.listing_type === 'rent' && property.monthly_rent) {
      return `₹${property.monthly_rent.toLocaleString('en-IN')}`;
    }
    return 'Price not available';
  };

  const getDisplayLocation = () => {
    if (property.address && property.address.trim() !== '') {
      return `${property.address}, ${property.city}, ${property.state}`;
    }
    return `${property.city}, ${property.state}`;
  };

  const getDisplayArea = () => {
    if (property.area) {
      return `${Math.floor(property.area)} sqft`;
    }
    return null;
  };

  const primaryImage = property.images && property.images.length > 0 ? property.images[0] : null;
  const imageCount = property.images?.length || 0;

  return (
    <TouchableOpacity className="mb-6" activeOpacity={0.7} disabled={isDeleting} onPress={onPress}>
      {/* Image Section */}
      <View
        className="relative mb-3"
        style={{
          height: 300,
          borderRadius: 20,
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 15,
            },
            android: {
              elevation: 10,
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

        {/* Image Count Badge */}
        {imageCount > 1 && (
          <View className="absolute right-4 top-4 flex-row items-center rounded-lg bg-black/70 px-2.5 py-1.5">
            <Text className="font-medium text-xs text-white" style={{ fontFamily: 'Inter-Medium' }}>
              {imageCount} photos
            </Text>
          </View>
        )}
      </View>

      {/* Details Section */}
      <View>
        {/* Title and Location */}
        <Text
          className="mb-2 font-semibold text-base text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}
          numberOfLines={2}>
          {property.title}
        </Text>

        {/* Location */}
        <View className="mb-3 flex-row items-center">
          <LocationIcon size={14} color="#6B7280" />
          <Text
            className="ml-1 text-sm text-[#6B7280] underline"
            style={{ fontFamily: 'Inter-Regular' }}
            numberOfLines={1}>
            {getDisplayLocation()}
          </Text>
        </View>

        {/* Property Info Row - Airbnb style */}
        <View className="mb-3 flex-row items-center" style={{ gap: 16 }}>
          {property.bedrooms && (
            <View className="flex-row items-center">
              <BedIcon size={16} color="#6B7280" />
              <Text className="ml-1 text-sm text-[#111928]" style={{ fontFamily: 'Inter-Regular' }}>
                {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}
              </Text>
            </View>
          )}
          {property.bathrooms && (
            <View className="flex-row items-center">
              <BathIcon size={16} color="#6B7280" />
              <Text className="ml-1 text-sm text-[#111928]" style={{ fontFamily: 'Inter-Regular' }}>
                {property.bathrooms} {property.bathrooms === 1 ? 'bathroom' : 'bathrooms'}
              </Text>
            </View>
          )}
          {getDisplayArea() && (
            <View className="flex-row items-center">
              <SqftIcon size={16} color="#6B7280" />
              <Text className="ml-1 text-sm text-[#111928]" style={{ fontFamily: 'Inter-Regular' }}>
                {getDisplayArea()}
              </Text>
            </View>
          )}
        </View>

        {/* Price */}
        <View className="flex-row items-baseline" style={{ gap: 4 }}>
          <Text
            className="font-semibold text-lg text-[#111928]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            {getDisplayPrice()}
          </Text>
          {property.listing_type === 'rent' && (
            <Text className="text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
              month
            </Text>
          )}
        </View>
        {property.price_negotiable && (
          <Text className="mt-1 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Price is negotiable
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
