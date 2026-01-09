import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Property } from '../../../services';
import DeleteIcon from '../../../components/icons/DeleteIcon';
import EditIcon from '../../../components/icons/EditIcon';
import BedIcon from '../../../components/icons/BedIcon';
import BathIcon from '../../../components/icons/BathIcon';
import SqftIcon from '../../../components/icons/SqftIcon';
import TimeIcon from '../../../components/icons/TimeIcon';
import TypeIcon from '../../../components/icons/TypeIcon';
import FloorIcon from '../../../components/icons/FloorIcon';
import CalendarIcon from '../../../components/icons/CalendarIcon';
import FurnishingIcon from '../../../components/icons/FurnishingIcon';
import LocationIcon from '../../../components/icons/LocationIcon';
import NotFoundIcon from '../../../components/icons/NotFoundIcon';
import ImageWithSkeleton from '../../../components/ImageWithSkeleton';

interface PropertyDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  property: Property;
  onDelete: () => void;
  onEdit?: () => void;
  isDeleting?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PropertyDetailBottomSheet({
  visible,
  onClose,
  property,
  onDelete,
  onEdit,
  isDeleting = false,
}: PropertyDetailBottomSheetProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['75%'], []);

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });
    } else {
      setCurrentImageIndex(0);
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

  const handleClose = () => {
    setCurrentImageIndex(0);
    bottomSheetRef.current?.dismiss();
  };

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

  const images = property.images && property.images.length > 0 ? property.images : [];

  if (!visible) return null;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
    >
      <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl flex-1">
            {/* Header */}
            <View className="border-b border-[#E5E7EB]">
              <View className="px-4 py-4 flex-row items-center">
                <TouchableOpacity
                  onPress={handleClose}
                  className="p-2 -ml-2"
                  activeOpacity={0.7}
                >
                  <Text className="text-2xl">×</Text>
                </TouchableOpacity>
                <View className="flex-1" />
                {onEdit && (
                  <TouchableOpacity
                    onPress={() => {
                      handleClose();
                      onEdit();
                    }}
                    className="p-2 mr-2"
                    activeOpacity={0.7}
                  >
                    <EditIcon size={24} color="#055c3a" />
                  </TouchableOpacity>
                )}
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      handleClose();
                      onDelete();
                    }}
                    className="p-2"
                    activeOpacity={0.7}
                  >
                    <DeleteIcon size={24} color="#DC2626" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Content */}
            <BottomSheetScrollView
              className="flex-1"
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
                              index === currentImageIndex ? 'bg-[#055c3a]' : 'bg-[#D1D5DB]'
                            }`}
                            style={{ width: index === currentImageIndex ? 24 : 8 }}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <View className="h-[250px] bg-[#F3F4F6] rounded-xl items-center justify-center mb-6">
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

                {/* Property Info Row - Container style */}
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

                {/* Price Section - Clean Airbnb style */}
                <View className="mb-6 pb-6 border-b border-[#E5E7EB]">
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

                {/* Description */}
                {property.description && property.description.trim() !== '' && (
                  <View className="mb-6 pb-6 border-b border-[#E5E7EB]">
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
                )}

                {/* Property Details - Container style */}
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

                {/* Location Section - Simple */}
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
              </View>
            </BottomSheetScrollView>
          </SafeAreaView>
    </BottomSheetModal>
  );
}

