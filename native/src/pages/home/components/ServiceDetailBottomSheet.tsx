import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import RenderHtml from 'react-native-render-html';
import { type Service } from '../../../services';
import StarIcon from '../../../components/icons/StarIcon';
import TimeIcon from '../../../components/icons/TimeIcon';
import CategoryIcon from '../../../components/icons/CategoryIcon';
import NotFoundIcon from '../../../components/icons/NotFoundIcon';
import ImageWithSkeleton from '../../../components/ImageWithSkeleton';

interface ServiceDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  service: Service;
  onBook?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ServiceDetailBottomSheet({
  visible,
  onClose,
  service,
  onBook,
}: ServiceDetailBottomSheetProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Sheet snap points - 75% of screen height
  const snapPoints = useMemo(() => ['75%'], []);

  // Open sheet when visible becomes true
  useEffect(() => {
    if (visible) {
      // Small delay to ensure the ref is ready
      requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });
    }
  }, [visible]);

  // Handle sheet dismiss
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setCurrentImageIndex(0);
      onClose();
    }
  }, [onClose]);

  // Render custom backdrop
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
    if (service.price_type === 'inquiry') {
      return 'Contact for pricing';
    }
    if (service.price) {
      return `₹${service.price.toLocaleString('en-IN')}`;
    }
    return 'Price not available';
  };

  const images = service.images && service.images.length > 0 ? service.images : [];
  const isHtmlDescription = service.description && /<[^>]*>/g.test(service.description);

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
              Service Details
            </Text>
          </View>
        </View>

        {/* Content */}
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: onBook ? 100 : 24 }}
        >
          {/* Image Carousel */}
          {images.length > 0 ? (
            <View className="mb-6">
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
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
            {/* Title and Category */}
            <View className="mb-6">
              <Text
                className="text-2xl font-semibold text-[#111928] mb-2"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                {service.name}
              </Text>
              {service.category && (
                <View className="flex-row items-center">
                  <CategoryIcon size={18} color="#6B7280" />
                  <Text
                    className="text-base text-[#6B7280] ml-1"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
                    {service.category.name}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Rating and Bookings */}
          {(service.rating !== undefined || service.total_bookings !== undefined) && (
            <View className="mb-6 border-b border-[#E5E7EB]">
              <View className="px-6 pb-6">
                <View className="flex-row items-center" style={{ gap: 16 }}>
                  {service.rating !== undefined && service.rating > 0 && (
                    <View className="flex-row items-center">
                      <StarIcon size={20} color="#FFC107" filled />
                      <Text
                        className="text-base font-semibold text-[#111928] ml-1"
                        style={{ fontFamily: 'Inter-SemiBold' }}
                      >
                        {service.rating.toFixed(1)}
                      </Text>
                    </View>
                  )}
                  {service.total_bookings !== undefined && service.total_bookings > 0 && (
                    <Text
                      className="text-base text-[#6B7280]"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      {service.total_bookings} {service.total_bookings === 1 ? 'booking' : 'bookings'}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Price Section */}
          <View className="mb-6 border-b border-[#E5E7EB]">
            <View className="px-6 pb-6">
              <Text
                className="text-3xl font-bold text-[#111928] mb-2"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                {getDisplayPrice()}
              </Text>
              {service.price_type === 'fixed' && service.duration && (
                <View className="flex-row items-center">
                  <TimeIcon size={16} color="#6B7280" />
                  <Text
                    className="text-sm text-[#6B7280] ml-1"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
                    {service.duration}
                  </Text>
                </View>
              )}

              {/* Inquiry-based pricing info */}
              {service.price_type === 'inquiry' && (
                <View className="bg-white rounded-xl border border-[#E5E7EB] mt-4 overflow-hidden">
                  <View className="border-b border-[#E5E7EB]">
                    <View className="px-4 py-3">
                      <Text
                        className="text-sm font-semibold text-[#111928]"
                        style={{ fontFamily: 'Inter-SemiBold' }}
                      >
                        How Inquiry-Based Pricing Works
                      </Text>
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
                        Pay a small inquiry fee to submit your service request
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
                        Our team will review your requirements and provide a custom quote
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
                        You can accept or reject the quote - no obligation
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
                        Pay for the actual service only if you accept the quote
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {service.description && service.description.trim() !== '' && (
            <View className="mb-6 border-b border-[#E5E7EB]">
              <View className="px-6 pb-6">
                <Text
                  className="text-xl font-semibold text-[#111928] mb-3"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  About this service
                </Text>
                {isHtmlDescription ? (
                  <RenderHtml
                    contentWidth={windowWidth - 48}
                    source={{ html: service.description }}
                    baseStyle={{
                      fontSize: 16,
                      lineHeight: 24,
                      color: '#374151',
                      fontFamily: 'Inter-Regular',
                    }}
                  />
                ) : (
                  <Text
                    className="text-base text-[#374151]"
                    style={{ fontFamily: 'Inter-Regular', lineHeight: 24 }}
                  >
                    {service.description}
                  </Text>
                )}
              </View>
            </View>
          )}
        </BottomSheetScrollView>

        {/* Book Button - Fixed at bottom */}
        {onBook && (
          <SafeAreaView edges={['bottom']} className="bg-white border-t border-[#E5E7EB]">
            <View className="px-6 py-4">
              <TouchableOpacity
                onPress={() => {
                  onBook();
                  bottomSheetRef.current?.dismiss();
                }}
                className="h-12 rounded-lg bg-[#00a871] items-center justify-center"
                activeOpacity={0.8}
              >
                <Text
                  className="text-base font-semibold text-white"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  {service.price_type === 'inquiry' ? 'Send Inquiry' : 'Book Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </View>
    </BottomSheetModal>
  );
}
