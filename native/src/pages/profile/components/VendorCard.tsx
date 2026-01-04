import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform, ScrollView } from 'react-native';
import { type Vendor } from '../../../services/api/vendor.service';
import LocationIcon from '../../../components/icons/LocationIcon';
import TypeIcon from '../../../components/icons/TypeIcon';
import PhoneIcon from '../../../components/icons/PhoneIcon';
import ProfileIcon from '../../../components/icons/ProfileIcon';
import VendorIcon from '../../../components/icons/VendorIcon';

interface VendorCardProps {
  vendor: Vendor;
  onPress?: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export default function VendorCard({ vendor, onPress, onDelete, isDeleting }: VendorCardProps) {
  const getDisplayLocation = () => {
    const city = vendor.business_address?.city || '';
    const state = vendor.business_address?.state || '';
    if (city && state) {
      return `${city}, ${state}`;
    }
    return city || state || 'Location not specified';
  };

  const getDisplayServices = () => {
    if (!vendor.services_offered || vendor.services_offered.length === 0) {
      return { displayed: [], remaining: 0 };
    }
    const displayed = vendor.services_offered.slice(0, 3);
    const remaining = vendor.services_offered.length - 3;
    return { displayed, remaining };
  };

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

  const primaryImage = vendor.profile_picture || null;
  const galleryCount = vendor.business_gallery?.length || 0;
  const serviceDisplay = getDisplayServices();

  return (
    <TouchableOpacity
      className="mb-6"
      activeOpacity={0.7}
      disabled={isDeleting}
      onPress={onPress}
    >
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
        }}
      >
        {primaryImage ? (
          <Image
            source={{ uri: primaryImage }}
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
              No Profile Picture
            </Text>
          </View>
        )}

        {/* Gallery Count Badge */}
        {galleryCount > 1 && (
          <View className="absolute top-4 right-4 px-2.5 py-1.5 rounded-lg bg-black/70 flex-row items-center">
            <Text className="text-white text-xs font-medium" style={{ fontFamily: 'Inter-Medium' }}>
              {`${galleryCount} photos`}
            </Text>
          </View>
        )}
      </View>

      {/* Details Section */}
      <View>
        {/* Vendor Name */}
        <Text
          className="text-base font-semibold text-[#111928] mb-2"
          style={{ fontFamily: 'Inter-SemiBold' }}
          numberOfLines={2}
        >
          {vendor.vendor_name || 'Unknown Vendor'}
        </Text>

        {/* Business Type */}
        <View className="flex-row items-center mb-2">
          <TypeIcon size={14} color="#6B7280" />
          <Text
            className="text-sm text-[#6B7280] ml-1"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            {getBusinessTypeLabel()}
          </Text>
        </View>

        {/* Location */}
        <View className="flex-row items-center mb-3">
          <LocationIcon size={14} color="#6B7280" />
          <Text
            className="text-sm text-[#6B7280] ml-1 underline"
            style={{ fontFamily: 'Inter-Regular' }}
            numberOfLines={1}
          >
            {getDisplayLocation()}
          </Text>
        </View>

        {/* Services Offered */}
        {serviceDisplay.displayed.length > 0 && (
          <View className="mb-3">
            <Text
              className="text-xs text-[#6B7280] mb-2"
              style={{ fontFamily: 'Inter-Medium' }}
            >
              Services Offered:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {serviceDisplay.displayed.map((service, index) => (
                <View
                  key={index}
                  className="px-3 py-1.5 rounded-full bg-[#F3F4F6] border border-[#E5E7EB]"
                >
                  <Text
                    className="text-xs text-[#111928]"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
                    {service}
                  </Text>
                </View>
              ))}
              {serviceDisplay.remaining > 0 && (
                <View className="px-3 py-1.5 rounded-full bg-[#055c3a]">
                  <Text
                    className="text-xs text-white"
                    style={{ fontFamily: 'Inter-Medium' }}
                  >
                    +{serviceDisplay.remaining} more
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* Contact Info Row */}
        <View className="flex-row items-center" style={{ gap: 16 }}>
          <View className="flex-row items-center">
            <ProfileIcon size={16} color="#6B7280" />
            <Text
              className="text-sm text-[#111928] ml-1"
              style={{ fontFamily: 'Inter-Regular' }}
              numberOfLines={1}
            >
              {vendor.contact_person_name || 'N/A'}
            </Text>
          </View>
          {vendor.contact_person_phone && (
            <View className="flex-row items-center">
              <PhoneIcon size={16} color="#6B7280" />
              <Text
                className="text-sm text-[#111928] ml-1"
                style={{ fontFamily: 'Inter-Regular' }}
              >
                {vendor.contact_person_phone}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
