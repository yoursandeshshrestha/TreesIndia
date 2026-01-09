import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Property } from '../../../services';
import BedIcon from '../../../components/icons/BedIcon';
import BathIcon from '../../../components/icons/BathIcon';
import SqftIcon from '../../../components/icons/SqftIcon';
import TimeIcon from '../../../components/icons/TimeIcon';
import TypeIcon from '../../../components/icons/TypeIcon';
import FloorIcon from '../../../components/icons/FloorIcon';
import CalendarIcon from '../../../components/icons/CalendarIcon';
import FurnishingIcon from '../../../components/icons/FurnishingIcon';
import LocationIcon from '../../../components/icons/LocationIcon';
import PhoneIcon from '../../../components/icons/PhoneIcon';
import NotFoundIcon from '../../../components/icons/NotFoundIcon';
import ProfileIcon from '../../../components/icons/ProfileIcon';
import InfoIcon from '../../../components/icons/InfoIcon';
import ImageWithSkeleton from '../../../components/ImageWithSkeleton';

interface PropertyDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  property: Property;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PropertyDetailBottomSheet({
  visible,
  onClose,
  property,
}: PropertyDetailBottomSheetProps) {
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

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setCurrentImageIndex(0);
      onClose();
    }
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const getDisplayPrice = () => {
    if (property.listing_type === 'sale' && property.sale_price) {
      return `₹${property.sale_price.toLocaleString('en-IN')}`;
    } else if (property.listing_type === 'rent' && property.monthly_rent) {
      return `₹${property.monthly_rent.toLocaleString('en-IN')}`;
    }
    return 'Price not available';
  };

  const getDisplayStatus = () => {
    if (!property.is_approved) {
      return 'Pending Review';
    }
    switch (property.status.toLowerCase()) {
      case 'available':
        return 'Available';
      case 'sold':
        return 'Sold';
      case 'rented':
        return 'Rented';
      default:
        return property.status;
    }
  };

  const getDisplayArea = () => {
    if (property.area) {
      return `${Math.floor(property.area)} sqft`;
    }
    return null;
  };

  const getDisplayAge = () => {
    if (!property.age) return null;
    const ageMap: Record<string, string> = {
      under_1_year: 'Under 1 year',
      '1_2_years': '1-2 years',
      '2_5_years': '2-5 years',
      '5_10_years': '5-10 years',
      '10_plus_years': '10+ years',
    };
    return ageMap[property.age] || property.age;
  };

  const handleCall = () => {
    if (!property.contact_number) {
      Alert.alert('Contact Unavailable', 'Contact information is not available for this property.');
      return;
    }

    const phoneNumber = `tel:${property.contact_number}`;
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
  };

  const images = property.images && property.images.length > 0 ? property.images : [];

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
      }}
    >
      <View className="flex-1">
            {/* Header */}
            <View className="border-b border-[#E5E7EB]">
              <View className="px-6 py-4">
                <Text
                  className="text-lg font-semibold text-[#111928] text-center"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  Property Details
                </Text>
              </View>
            </View>

            {/* Content */}
            <BottomSheetScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Image Carousel */}
              {images.length > 0 ? (
                <View className="mb-6">
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    removeClippedSubviews={true}
                    decelerationRate="fast"
                    onMomentumScrollEnd={(event) => {
                      const imageWidth = SCREEN_WIDTH;
                      const index = Math.round(event.nativeEvent.contentOffset.x / imageWidth);
                      setCurrentImageIndex(index);
                    }}
                  >
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
                    <View className="flex-row justify-center mt-2" style={{ gap: 6 }}>
                      {images.map((_, index) => (
                        <View
                          key={index}
                          className={`h-1.5 rounded-full ${
                            index === currentImageIndex ? 'bg-[#00a871]' : 'bg-[#D1D5DB]'
                          }`}
                          style={{ width: index === currentImageIndex ? 24 : 8 }}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View className="h-[250px] bg-[#F3F4F6] items-center justify-center mb-6">
                  <NotFoundIcon size={64} color="#9CA3AF" />
                  <Text
                    className="text-base text-[#9CA3AF] mt-4"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
                    No Images Available
                  </Text>
                </View>
              )}

              <View className="px-6">
                {/* Title and Location */}
                <View className="mb-6">
                  <Text
                    className="text-2xl font-semibold text-[#111928] mb-2"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    {property.title}
                  </Text>
                  {property.address && property.address.trim() !== '' && (
                    <View className="flex-row items-center">
                      <LocationIcon size={18} color="#6B7280" />
                      <Text
                        className="flex-1 text-base text-[#6B7280] underline ml-1"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        {property.address}, {property.city}, {property.state}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Property Info Row */}
                <View className="bg-white border border-[#E5E7EB] rounded-xl p-4 mb-6">
                  <View className="flex-row items-center">
                    {property.bedrooms && (
                      <View className="flex-1 items-center border-r border-[#E5E7EB] pr-4">
                        <View className="flex-row items-center mb-1">
                          <BedIcon size={20} color="#111928" />
                        </View>
                        <Text
                          className="text-sm text-[#111928]"
                          style={{ fontFamily: 'Inter-Regular' }}
                        >
                          {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}
                        </Text>
                      </View>
                    )}
                    {property.bathrooms && (
                      <View className={`flex-1 items-center ${property.bedrooms ? 'border-r border-[#E5E7EB] px-4' : 'pr-4'}`}>
                        <View className="flex-row items-center mb-1">
                          <BathIcon size={20} color="#111928" />
                        </View>
                        <Text
                          className="text-sm text-[#111928]"
                          style={{ fontFamily: 'Inter-Regular' }}
                        >
                          {property.bathrooms} {property.bathrooms === 1 ? 'bathroom' : 'bathrooms'}
                        </Text>
                      </View>
                    )}
                    {getDisplayArea() && (
                      <View className={`flex-1 items-center ${(property.bedrooms || property.bathrooms) ? 'pl-4' : ''}`}>
                        <View className="flex-row items-center mb-1">
                          <SqftIcon size={20} color="#111928" />
                        </View>
                        <Text
                          className="text-sm text-[#111928]"
                          style={{ fontFamily: 'Inter-Regular' }}
                        >
                          {getDisplayArea()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Price Section */}
              <View className="mb-6 border-b border-[#E5E7EB]">
                <View className="px-6 pb-6">
                  <View className="flex-row items-baseline mb-2" style={{ gap: 8 }}>
                    <Text
                      className="text-3xl font-bold text-[#111928]"
                      style={{ fontFamily: 'Inter-Bold' }}
                    >
                      {getDisplayPrice()}
                    </Text>
                    {property.listing_type === 'rent' && (
                      <Text
                        className="text-base text-[#6B7280]"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        month
                      </Text>
                    )}
                  </View>
                  {property.price_negotiable && (
                    <Text
                      className="text-sm text-[#6B7280]"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      Price is negotiable
                    </Text>
                  )}
                </View>
              </View>

              {/* Description */}
              {property.description && property.description.trim() !== '' && (
                <View className="mb-6 border-b border-[#E5E7EB]">
                  <View className="px-6 pb-6">
                    <Text
                      className="text-xl font-semibold text-[#111928] mb-3"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      About this place
                    </Text>
                    <Text
                      className="text-base text-[#374151]"
                      style={{ fontFamily: 'Inter-Regular', lineHeight: 24 }}
                    >
                      {property.description}
                    </Text>
                  </View>
                </View>
              )}

              <View className="px-6">
                {/* Property Details */}
                <View className="mb-6">
                  <Text
                    className="text-xl font-semibold text-[#111928] mb-4"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    What this place offers
                  </Text>
                  <View className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                    {[
                      { label: 'Status', value: getDisplayStatus(), icon: TimeIcon },
                      getDisplayArea() ? { label: 'Area', value: getDisplayArea()!, icon: SqftIcon } : null,
                      property.bedrooms ? {
                        label: 'Bedrooms',
                        value: `${property.bedrooms}`,
                        icon: BedIcon,
                      } : null,
                      property.bathrooms ? {
                        label: 'Bathrooms',
                        value: `${property.bathrooms}`,
                        icon: BathIcon,
                      } : null,
                      property.property_type ? {
                        label: 'Type',
                        value:
                          property.property_type.charAt(0).toUpperCase() +
                          property.property_type.slice(1),
                        icon: TypeIcon,
                      } : null,
                      property.floor_number ? {
                        label: 'Floor',
                        value: `${property.floor_number}`,
                        icon: FloorIcon,
                      } : null,
                      getDisplayAge() ? { label: 'Age', value: getDisplayAge()!, icon: CalendarIcon } : null,
                      property.furnishing_status ? {
                        label: 'Furnishing',
                        value:
                          property.furnishing_status
                            .split('_')
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(' ') || property.furnishing_status,
                        icon: FurnishingIcon,
                      } : null,
                    ]
                      .filter((detail): detail is NonNullable<typeof detail> => detail !== null)
                      .reduce((rows: typeof detail[][], detail, index) => {
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
                          style={{ marginBottom: rowIndex < allRows.length - 1 ? 16 : 0 }}
                        >
                          {row.map((detail, colIndex) => {
                            const IconComponent = detail.icon;
                            const isLastInRow = colIndex === row.length - 1;
                            return (
                              <View
                                key={colIndex}
                                className={`flex-1 items-center ${!isLastInRow ? 'border-r border-[#E5E7EB] pr-4' : ''} ${colIndex === 1 ? 'pl-4' : ''}`}
                              >
                                <View className="mb-2">
                                  <IconComponent size={20} color="#111928" />
                                </View>
                                <Text
                                  className="text-sm font-semibold text-[#111928] mb-1"
                                  style={{ fontFamily: 'Inter-SemiBold' }}
                                >
                                  {detail.value}
                                </Text>
                                <Text
                                  className="text-xs text-[#6B7280]"
                                  style={{ fontFamily: 'Inter-Regular' }}
                                >
                                  {detail.label}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      ))}
                  </View>
                </View>

                {/* Location Section */}
                <View className="mb-8">
                  <View className="flex-row items-center mb-3">
                    <Text
                      className="text-xl font-semibold text-[#111928] ml-2"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      Address
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <LocationIcon size={18} color="#6B7280" />
                    <Text
                      className="text-base text-[#374151] ml-2 flex-1"
                      style={{ fontFamily: 'Inter-Regular', lineHeight: 24 }}
                    >
                      {property.address && property.address.trim() !== ''
                        ? `${property.address}, ${property.city}, ${property.state}${property.pincode ? ` ${property.pincode}` : ''}`
                        : `${property.city}, ${property.state}${property.pincode ? ` ${property.pincode}` : ''}`}
                    </Text>
                  </View>
                </View>

                {/* Contact Person */}
                {property.contact_number && (
                  <>
                    <View className="bg-white border border-[#E5E7EB] rounded-xl p-4 mb-6">
                      <Text
                        className="text-sm font-semibold text-[#6B7280] mb-3"
                        style={{ fontFamily: 'Inter-SemiBold' }}
                      >
                        Contact Person
                      </Text>
                      {property.owner_name && (
                        <View className="flex-row items-center mb-2">
                          <ProfileIcon size={16} color="#111928" />
                          <Text
                            className="text-base text-[#111928] ml-2"
                            style={{ fontFamily: 'Inter-Regular' }}
                          >
                            {property.owner_name}
                          </Text>
                        </View>
                      )}
                      <View className="flex-row items-center mb-2">
                        <PhoneIcon size={16} color="#111928" />
                        <Text
                          className="text-base text-[#111928] ml-2"
                          style={{ fontFamily: 'Inter-Regular' }}
                        >
                          {property.contact_number}
                        </Text>
                      </View>
                    </View>

                    {/* Professional Warning Message */}
                    <View className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden mb-6">
                      <View className="border-b border-[#E5E7EB]">
                        <View className="px-4 py-3">
                          <View className="flex-row items-center">
                            <InfoIcon size={18} color="#111928" />
                            <Text
                              className="text-sm font-semibold text-[#111928] ml-2"
                              style={{ fontFamily: 'Inter-SemiBold' }}
                            >
                              Important Notice
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View className="px-4 py-3">
                        <View className="flex-row items-start mb-2">
                          <View
                            className="w-1 h-1 rounded-full bg-[#9CA3AF]"
                            style={{ marginTop: 8, marginRight: 12 }}
                          />
                          <Text
                            className="flex-1 text-sm text-[#374151]"
                            style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}
                          >
                            Use contact information responsibly for genuine property inquiries only
                          </Text>
                        </View>
                        <View className="flex-row items-start mb-2">
                          <View
                            className="w-1 h-1 rounded-full bg-[#9CA3AF]"
                            style={{ marginTop: 8, marginRight: 12 }}
                          />
                          <Text
                            className="flex-1 text-sm text-[#374151]"
                            style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}
                          >
                            Spam, harassment, or misuse of contact details is strictly prohibited
                          </Text>
                        </View>
                        <View className="flex-row items-start">
                          <View
                            className="w-1 h-1 rounded-full bg-[#9CA3AF]"
                            style={{ marginTop: 8, marginRight: 12 }}
                          />
                          <Text
                            className="flex-1 text-sm text-[#374151]"
                            style={{ fontFamily: 'Inter-Regular', lineHeight: 20 }}
                          >
                            Reported users face immediate account suspension without prior notice
                          </Text>
                        </View>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </BottomSheetScrollView>

            {/* Contact Button */}
            {property.contact_number && (
              <SafeAreaView edges={['bottom']} className="bg-white border-t border-[#E5E7EB]">
                <View className="px-6 py-4">
                  <TouchableOpacity
                    onPress={handleCall}
                    className="bg-[#055c3a] rounded-lg py-3.5 items-center flex-row justify-center"
                    activeOpacity={0.7}
                    style={{ gap: 8 }}
                  >
                    <PhoneIcon size={20} color="#FFFFFF" />
                    <Text
                      className="text-white text-base font-semibold"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      Contact Property Owner
                    </Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            )}
      </View>
    </BottomSheetModal>
  );
}
