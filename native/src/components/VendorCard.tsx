import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { type Vendor } from '../services';
import VendorIcon from './icons/VendorIcon';
import LocationIcon from './icons/LocationIcon';
import TypeIcon from './icons/TypeIcon';
import BlurWrapper from './BlurWrapper';
import ImageWithSkeleton from './ImageWithSkeleton';

interface VendorCardProps {
  vendor: Vendor;
  onPress?: () => void;
  width?: number;
  shouldBlur?: boolean;
}

export default function VendorCard({
  vendor,
  onPress,
  width = 200,
  shouldBlur = false,
}: VendorCardProps) {
  const getBusinessTypeLabel = () => {
    const typeMap: Record<string, string> = {
      individual: 'Individual',
      partnership: 'Partnership',
      company: 'Company',
      llp: 'LLP',
      pvt_ltd: 'Private Limited',
      public_ltd: 'Public Limited',
      other: 'Other',
    };
    return typeMap[vendor.business_type] || vendor.business_type || 'N/A';
  };

  const getTopServices = () => {
    if (!vendor.services_offered || vendor.services_offered.length === 0) {
      return 'No services listed';
    }
    if (vendor.services_offered.length <= 2) {
      return vendor.services_offered.join(', ');
    }
    return `${vendor.services_offered.slice(0, 2).join(', ')} +${vendor.services_offered.length - 2}`;
  };

  const getLocation = () => {
    if (vendor.business_address?.city && vendor.business_address?.state) {
      return `${vendor.business_address.city}, ${vendor.business_address.state}`;
    }
    if (vendor.business_address?.city) {
      return vendor.business_address.city;
    }
    return 'Location not specified';
  };

  return (
    <TouchableOpacity
      className="mb-3"
      activeOpacity={0.7}
      onPress={onPress}
      style={{ width, flexShrink: 1 }}
    >
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
          }}
        >
          {vendor.profile_picture ? (
            <ImageWithSkeleton
              source={{ uri: vendor.profile_picture }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-[#F3F4F6] items-center justify-center">
              <VendorIcon size={64} color="#9CA3AF" />
              <Text
                className="text-sm text-[#9CA3AF] mt-2"
                style={{ fontFamily: 'Inter-Regular' }}
              >
                No Photo
              </Text>
            </View>
          )}

          {/* Business Type Badge - Top Left */}
          <View
            className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-1 flex-row items-center"
            style={{ gap: 4 }}
          >
            <TypeIcon size={12} color="#6B7280" />
            <Text
              className="text-xs font-semibold text-[#111928]"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              {getBusinessTypeLabel()}
            </Text>
          </View>

          {/* Verified Badge */}
          {vendor.is_verified && (
            <View
              className="absolute top-2 right-2 bg-[#00a871] rounded-full px-2 py-1 flex-row items-center"
              style={{ gap: 4 }}
            >
              <Text className="text-white text-xs">✓</Text>
              <Text
                className="text-xs font-semibold text-white"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                Verified
              </Text>
            </View>
          )}

          {/* Gallery Count Badge */}
          {vendor.business_gallery && vendor.business_gallery.length > 0 && (
            <View className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70">
              <Text className="text-white text-xs font-medium" style={{ fontFamily: 'Inter-Medium' }}>
                {`${vendor.business_gallery.length} photos`}
              </Text>
            </View>
          )}
        </View>
      </BlurWrapper>

      {/* Details Section */}
      {shouldBlur ? (
        <View style={{ paddingHorizontal: 8 }}>
          <View style={{ height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 8, width: '80%' }} />
          <View style={{ height: 12, backgroundColor: '#F3F4F6', borderRadius: 4, marginBottom: 8, width: '60%' }} />
          <View style={{ height: 12, backgroundColor: '#F3F4F6', borderRadius: 4, width: '40%' }} />
        </View>
      ) : (
        <View>
          {/* Vendor Name */}
          <Text
            className="text-sm font-semibold text-[#111928] mb-1"
            style={{ fontFamily: 'Inter-SemiBold' }}
            numberOfLines={1}
          >
            {vendor.vendor_name || 'Unknown Vendor'}
          </Text>

          {/* Rating */}
          {vendor.rating !== undefined && vendor.rating > 0 && (
            <View className="flex-row items-center mb-2" style={{ gap: 4 }}>
              <Text className="text-xs">⭐</Text>
              <Text
                className="text-xs font-medium text-[#111928]"
                style={{ fontFamily: 'Inter-Medium' }}
              >
                {vendor.rating.toFixed(1)}
              </Text>
            </View>
          )}

          {/* Location */}
          <View className="flex-row items-center mb-2">
            <LocationIcon size={12} color="#6B7280" />
            <Text
              className="text-xs text-[#6B7280] ml-1"
              style={{ fontFamily: 'Inter-Regular' }}
              numberOfLines={1}
            >
              {getLocation()}
            </Text>
          </View>

          {/* Services - At Last */}
          <Text
            className="text-xs text-[#374151]"
            style={{ fontFamily: 'Inter-Regular' }}
            numberOfLines={2}
          >
            {getTopServices()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
