import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  Easing,
} from 'react-native';
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
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View className="flex-1">
        {/* Overlay */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: overlayOpacity,
          }}
        >
          <View className="flex-1" />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY }],
          }}
        >
          <SafeAreaView edges={['bottom']}>
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
        </Animated.View>
      </View>
    </Modal>
  );
}
