import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import Button from '../../../components/ui/Button';
import CheckmarkIcon from '../../../components/icons/CheckmarkIcon';
import CancelIcon from '../../../components/icons/CancelIcon';

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
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
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
      }}>
      <SafeAreaView edges={['bottom']} className="flex-1">
        {/* Floating Close Button */}
        <View
          style={{
            position: 'absolute',
            top: -56,
            right: 16,
            zIndex: 30,
          }}>
          <TouchableOpacity
            onPress={onViewBookings}
            className="h-12 w-12 items-center justify-center rounded-full bg-white"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}>
            <CancelIcon size={24} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="px-6 py-8">
          {/* Success Icon */}
          <Animated.View
            className="mb-6 items-center"
            style={{
              transform: [{ scale: scaleAnim }],
            }}>
            <View className="h-20 w-20 items-center justify-center rounded-full bg-[#00a871]">
              <CheckmarkIcon size={40} color="white" />
            </View>
          </Animated.View>

          {/* Success Message */}
          <Text
            className="mb-2 text-center font-bold text-2xl text-[#111928]"
            style={{ fontFamily: 'Inter-Bold' }}>
            {bookingType === 'fixed' ? 'Booking Confirmed!' : 'Inquiry Submitted!'}
          </Text>

          <Text
            className="mb-6 text-center text-base text-[#6B7280]"
            style={{ fontFamily: 'Inter-Regular' }}>
            {bookingType === 'fixed'
              ? 'Your booking has been confirmed successfully. You will receive a confirmation shortly.'
              : 'Your inquiry has been submitted. Our team will contact you soon with more details.'}
          </Text>

          {/* Booking ID */}
          {bookingId && (
            <View className="mb-6 rounded-xl bg-[#F9FAFB] p-4">
              <Text
                className="text-center text-sm text-[#6B7280]"
                style={{ fontFamily: 'Inter-Regular' }}>
                Booking ID
              </Text>
              <Text
                className="mt-1 text-center font-semibold text-xl text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}>
                #{bookingId}
              </Text>
            </View>
          )}

          {/* Action Button */}
          <Button label="View My Bookings" onPress={onViewBookings} />

          {/* Auto-redirect message */}
          <Text
            className="mt-4 text-center text-sm text-[#9CA3AF]"
            style={{ fontFamily: 'Inter-Regular' }}>
            Redirecting in 3 seconds...
          </Text>
        </View>
      </SafeAreaView>
    </BottomSheetModal>
  );
}
