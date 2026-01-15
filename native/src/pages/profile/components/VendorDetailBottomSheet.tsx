import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { type Vendor } from '../../../services/api/vendor.service';
import DeleteIcon from '../../../components/icons/DeleteIcon';
import EditIcon from '../../../components/icons/EditIcon';
import TypeIcon from '../../../components/icons/TypeIcon';
import TimeIcon from '../../../components/icons/TimeIcon';
import StarIcon from '../../../components/icons/StarIcon';
import LocationIcon from '../../../components/icons/LocationIcon';
import ProfileIcon from '../../../components/icons/ProfileIcon';
import PhoneIcon from '../../../components/icons/PhoneIcon';
import VendorIcon from '../../../components/icons/VendorIcon';
import MailIcon from '../../../components/icons/MailIcon';
import ImageWithSkeleton from '../../../components/ImageWithSkeleton';

interface VendorDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  vendor: Vendor;
  onDelete: () => void;
  onEdit?: () => void;
  isDeleting?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function VendorDetailBottomSheet({
  visible,
  onClose,
  vendor,
  onDelete,
  onEdit,
  isDeleting = false,
}: VendorDetailBottomSheetProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['80%'], []);

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });
    } else {
      bottomSheetRef.current?.dismiss();
      setCurrentImageIndex(0);
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
      vendor.business_address.street,
      vendor.business_address.city,
      vendor.business_address.state,
      vendor.business_address.pincode,
    ].filter(Boolean);
    if (vendor.business_address.landmark) {
      parts.push(`(${vendor.business_address.landmark})`);
    }
    return parts.join(', ');
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
          <View className="flex-row items-center justify-end px-4 py-4">
            {onEdit && (
              <TouchableOpacity
                onPress={() => {
                  bottomSheetRef.current?.dismiss();
                  onEdit();
                }}
                className="mr-2 p-2"
                activeOpacity={0.7}>
                <EditIcon size={24} color="#055c3a" />
              </TouchableOpacity>
            )}
            {isDeleting ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <TouchableOpacity
                onPress={() => {
                  bottomSheetRef.current?.dismiss();
                  onDelete();
                }}
                className="p-2"
                activeOpacity={0.7}>
                <DeleteIcon size={24} color="#DC2626" />
              </TouchableOpacity>
            )}
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
            {/* Vendor Name */}
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

            {/* Contact Person Details */}
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

            {/* Business Description */}
            {vendor.business_description && vendor.business_description.trim() !== '' && (
              <View className="mb-6 border-b border-[#E5E7EB] pb-6">
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
            )}

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

            {/* Services Offered */}
            {vendor.services_offered && vendor.services_offered.length > 0 && (
              <View className="mb-6 border-b border-[#E5E7EB] pb-6">
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
            )}

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
      </View>
    </BottomSheetModal>
  );
}
