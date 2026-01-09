import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import CheckmarkIcon from '../../../components/icons/CheckmarkIcon';

interface BookingSuccessBottomSheetProps {
  visible: boolean;
  bookingId: number | null;
  bookingType: 'fixed' | 'inquiry';
  onViewBookings: () => void;
}

export default function BookingSuccessBottomSheet({
  visible,
  bookingId,
  bookingType,
  onViewBookings,
}: BookingSuccessBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['60%'], []);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        bottomSheetRef.current?.present();
      });

      // Animate checkmark
      setTimeout(() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }, 200);

      // Auto-navigate after 3 seconds
      const timeout = setTimeout(() => {
        onViewBookings();
      }, 3000);

      return () => clearTimeout(timeout);
    } else {
      // Reset animations when hidden
      scaleAnim.setValue(0);
    }
  }, [visible]);

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

  if (!visible) return null;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
    >
      <SafeAreaView edges={['bottom']} className="flex-1">
        {/* Content */}
        <View className="px-6 py-8">
              {/* Success Icon */}
              <Animated.View
                className="items-center mb-6"
                style={{
                  transform: [{ scale: scaleAnim }],
                }}
              >
                <View className="w-20 h-20 bg-[#00a871] rounded-full items-center justify-center">
                  <CheckmarkIcon size={40} color="white" />
                </View>
              </Animated.View>

              {/* Success Message */}
              <Text
                className="text-2xl font-bold text-[#111928] text-center mb-2"
                style={{ fontFamily: 'Inter-Bold' }}
              >
                {bookingType === 'fixed' ? 'Booking Confirmed!' : 'Inquiry Submitted!'}
              </Text>

              <Text
                className="text-base text-[#6B7280] text-center mb-6"
                style={{ fontFamily: 'Inter-Regular' }}
              >
                {bookingType === 'fixed'
                  ? 'Your booking has been confirmed successfully. You will receive a confirmation shortly.'
                  : 'Your inquiry has been submitted. Our team will contact you soon with more details.'}
              </Text>

              {/* Booking ID */}
              {bookingId && (
                <View className="mb-6 p-4 bg-[#F9FAFB] rounded-xl">
                  <Text className="text-sm text-[#6B7280] text-center" style={{ fontFamily: 'Inter-Regular' }}>
                    Booking ID
                  </Text>
                  <Text className="text-xl font-semibold text-[#111928] text-center mt-1" style={{ fontFamily: 'Inter-SemiBold' }}>
                    #{bookingId}
                  </Text>
                </View>
              )}

              {/* Action Button */}
              <Button label="View My Bookings" onPress={onViewBookings} />

              {/* Auto-redirect message */}
              <Text className="text-sm text-[#9CA3AF] text-center mt-4" style={{ fontFamily: 'Inter-Regular' }}>
                Redirecting in 3 seconds...
              </Text>
            </View>
          </SafeAreaView>
    </BottomSheetModal>
  );
}
