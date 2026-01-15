import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Linking, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Vendor } from '../services';
import VendorIcon from './icons/VendorIcon';
import LocationIcon from './icons/LocationIcon';
import PhoneIcon from './icons/PhoneIcon';
import TimeIcon from './icons/TimeIcon';
import StarIcon from './icons/StarIcon';
import TypeIcon from './icons/TypeIcon';
import ProfileIcon from './icons/ProfileIcon';
import MailIcon from './icons/MailIcon';
import ImageWithSkeleton from './ImageWithSkeleton';

interface VendorDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  vendor: Vendor;
  onContact?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function VendorDetailBottomSheet({
  visible,
  onClose,
  vendor,
  onContact,
}: VendorDetailBottomSheetProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['75%'], []);

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });
    }
  }, [visible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        setCurrentImageIndex(0);
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

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

  const getFullAddress = () => {
    const parts = [
      vendor.business_address?.street,
      vendor.business_address?.city,
      vendor.business_address?.state,
      vendor.business_address?.pincode,
    ].filter(Boolean);
    if (vendor.business_address?.landmark) {
      parts.push(`(${vendor.business_address.landmark})`);
    }
    return parts.join(', ') || 'Address not specified';
  };

  const handleCall = () => {
    if (!vendor.contact_person_phone) {
      Alert.alert('Contact Unavailable', 'Contact information is not available for this vendor.');
      return;
    }

    const phoneNumber = `tel:${vendor.contact_person_phone}`;
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneNumber);
        } else {
          Alert.alert('Error', 'Unable to open phone dialer.');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Unable to open phone dialer.');
      });

    if (onContact) {
      onContact();
    }
  };

  const images =
    vendor.business_gallery && vendor.business_gallery.length > 0 ? vendor.business_gallery : [];

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableDynamicSizing={false}
      backgroundStyle={{
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}>
      <View className="flex-1">
        {/* Header */}
        <View className="border-b border-[#E5E7EB]">
          <View className="px-6 py-4">
            <Text
              className="text-center font-semibold text-lg text-[#111928]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              Vendor Details
            </Text>
          </View>
        </View>

        {/* Content */}
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Image Carousel */}
          {images.length > 0 ? (
            <View className="mb-6">
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const imageWidth = SCREEN_WIDTH;
                  const index = Math.round(event.nativeEvent.contentOffset.x / imageWidth);
                  setCurrentImageIndex(index);
                }}>
                {images.map((imageUri, index) => (
                  <ImageWithSkeleton
                    key={index}
                    source={{ uri: imageUri }}
                    style={{ width: SCREEN_WIDTH, height: 250 }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View className="mt-2 flex-row justify-center" style={{ gap: 6 }}>
                  {images.map((_, index) => (
                    <View
                      key={index}
                      className={`h-1.5 rounded-full ${
                        index === currentImageIndex ? 'bg-[#055c3a]' : 'bg-[#D1D5DB]'
                      }`}
                      style={{ width: index === currentImageIndex ? 24 : 8 }}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : vendor.profile_picture ? (
            <ImageWithSkeleton
              source={{ uri: vendor.profile_picture }}
              style={{ width: SCREEN_WIDTH, height: 250 }}
              resizeMode="cover"
              className="mb-6"
            />
          ) : (
            <View className="mb-6 h-[250px] items-center justify-center bg-[#F3F4F6]">
              <VendorIcon size={64} color="#9CA3AF" />
              <Text
                className="mt-4 text-base text-[#9CA3AF]"
                style={{ fontFamily: 'Inter-Regular' }}>
                No Images Available
              </Text>
            </View>
          )}

          <View className="px-6">
            {/* Vendor Name & Type */}
            <View className="mb-6">
              <Text
                className="mb-2 font-semibold text-2xl text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                {vendor.vendor_name || 'Unknown Vendor'}
              </Text>
              <View className="flex-row items-center">
                <TypeIcon size={18} color="#6B7280" />
                <Text
                  className="ml-1 text-base text-[#6B7280]"
                  style={{ fontFamily: 'Inter-Regular' }}>
                  {getBusinessTypeLabel()}
                </Text>
              </View>
            </View>
          </View>

          {/* Business Description */}
          {vendor.business_description && vendor.business_description.trim() !== '' && (
            <View className="mb-6 border-b border-[#E5E7EB] pb-6">
              <View className="px-6">
                <Text
                  className="mb-3 font-semibold text-xl text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  About this business
                </Text>
                <Text
                  className="text-base text-[#374151]"
                  style={{ fontFamily: 'Inter-Regular', lineHeight: 24 }}>
                  {vendor.business_description}
                </Text>
              </View>
            </View>
          )}

          <View className="px-6">
            {/* Business Details */}
            <View className="mb-6">
              <Text
                className="mb-4 font-semibold text-xl text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Business Details
              </Text>
              <View className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                {[
                  { label: 'Business Type', value: getBusinessTypeLabel(), icon: TypeIcon },
                  vendor.years_in_business > 0
                    ? {
                        label: 'Years in Business',
                        value: `${vendor.years_in_business} ${vendor.years_in_business === 1 ? 'year' : 'years'}`,
                        icon: TimeIcon,
                      }
                    : null,
                  vendor.rating && vendor.rating > 0
                    ? {
                        label: 'Rating',
                        value: `${vendor.rating.toFixed(1)} ⭐`,
                        icon: StarIcon,
                      }
                    : null,
                  vendor.total_jobs && vendor.total_jobs > 0
                    ? {
                        label: 'Total Jobs',
                        value: `${vendor.total_jobs}`,
                        icon: TimeIcon,
                      }
                    : null,
                ]
                  .filter((detail): detail is NonNullable<typeof detail> => detail !== null)
                  .reduce((rows: (typeof detail)[][], detail, index) => {
                    const rowIndex = Math.floor(index / 2);
                    if (!rows[rowIndex]) {
                      rows[rowIndex] = [];
                    }
                    rows[rowIndex].push(detail);
                    return rows;
                  }, [])
                  .map((row, rowIndex, allRows) => (
                    <View
                      key={rowIndex}
                      className="flex-row"
                      style={{ marginBottom: rowIndex < allRows.length - 1 ? 16 : 0 }}>
                      {row.map((detail, colIndex) => {
                        const IconComponent = detail.icon;
                        const isLastInRow = colIndex === row.length - 1;
                        return (
                          <View
                            key={colIndex}
                            className={`flex-1 items-center ${!isLastInRow ? 'border-r border-[#E5E7EB] pr-4' : ''} ${colIndex === 1 ? 'pl-4' : ''}`}>
                            <View className="mb-2">
                              <IconComponent size={20} color="#111928" />
                            </View>
                            <Text
                              className="mb-1 font-semibold text-sm text-[#111928]"
                              style={{ fontFamily: 'Inter-SemiBold' }}>
                              {detail.value}
                            </Text>
                            <Text
                              className="text-xs text-[#6B7280]"
                              style={{ fontFamily: 'Inter-Regular' }}>
                              {detail.label}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
              </View>
            </View>
          </View>

          {/* Services Offered */}
          {vendor.services_offered && vendor.services_offered.length > 0 && (
            <View className="mb-6 border-b border-[#E5E7EB] pb-6">
              <View className="px-6">
                <Text
                  className="mb-4 font-semibold text-xl text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  Services Offered
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {vendor.services_offered.map((service, index) => (
                    <View
                      key={index}
                      className="rounded-full border border-[#E5E7EB] bg-[#F3F4F6] px-4 py-2">
                      <Text
                        className="text-sm text-[#111928]"
                        style={{ fontFamily: 'Inter-Regular' }}>
                        {service}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          <View className="px-6">
            {/* Contact Person */}
            <View className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-4">
              <Text
                className="mb-3 font-semibold text-sm text-[#6B7280]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Contact Person
              </Text>
              <View className="mb-2 flex-row items-center">
                <ProfileIcon size={16} color="#111928" />
                <Text
                  className="ml-2 text-base text-[#111928]"
                  style={{ fontFamily: 'Inter-Regular' }}>
                  {vendor.contact_person_name || 'N/A'}
                </Text>
              </View>
              <View className="mb-2 flex-row items-center">
                <PhoneIcon size={16} color="#111928" />
                <Text
                  className="ml-2 text-base text-[#111928]"
                  style={{ fontFamily: 'Inter-Regular' }}>
                  {vendor.contact_person_phone || 'N/A'}
                </Text>
              </View>
              {vendor.contact_person_email && (
                <View className="flex-row items-center">
                  <MailIcon size={16} color="#111928" />
                  <Text
                    className="ml-2 text-base text-[#111928]"
                    style={{ fontFamily: 'Inter-Regular' }}>
                    {vendor.contact_person_email}
                  </Text>
                </View>
              )}
            </View>

            {/* Business Address */}
            <View className="mb-8">
              <View className="mb-3 flex-row items-center">
                <Text
                  className="ml-2 font-semibold text-xl text-[#111928]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  Business Address
                </Text>
              </View>
              <View className="flex-row items-start">
                <LocationIcon size={18} color="#6B7280" />
                <Text
                  className="ml-2 flex-1 text-base text-[#374151]"
                  style={{ fontFamily: 'Inter-Regular', lineHeight: 24 }}>
                  {getFullAddress()}
                </Text>
              </View>
            </View>
          </View>
        </BottomSheetScrollView>

        {/* Contact Button */}
        <SafeAreaView edges={['bottom']} className="border-t border-[#E5E7EB] bg-white">
          <View className="px-6 py-4">
            <TouchableOpacity
              onPress={handleCall}
              className="flex-row items-center justify-center rounded-lg bg-[#055c3a] py-3.5"
              activeOpacity={0.7}
              style={{ gap: 8 }}>
              <PhoneIcon size={20} color="#FFFFFF" />
              <Text
                className="font-semibold text-base text-white"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                Contact Vendor
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </BottomSheetModal>
  );
}
