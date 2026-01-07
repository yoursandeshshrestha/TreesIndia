import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookingService } from '../../../services';
import { TimeSlot, BookingConfig } from '../../../types/booking';
import Button from '../../../components/ui/Button';

interface SlotSelectionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectSlot: (date: string, slot: TimeSlot) => void;
  serviceId: number;
  duration?: string;
  selectedDate?: string;
  selectedSlotId?: string;
}

interface DateOption {
  date: string;
  displayDate: string;
  displayDay: string;
}

export default function SlotSelectionBottomSheet({
  visible,
  onClose,
  onSelectSlot,
  serviceId,
  duration,
  selectedDate,
  selectedSlotId,
}: SlotSelectionBottomSheetProps) {
  const [dates, setDates] = useState<DateOption[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(selectedDate || '');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [bookingConfig, setBookingConfig] = useState<BookingConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      fetchBookingConfig();
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
    }
  }, [visible]);

  const fetchBookingConfig = async () => {
    setIsLoadingConfig(true);
    try {
      const config = await bookingService.getBookingConfig();
      setBookingConfig(config);
      generateDates(config);
    } catch (error) {
      console.error('[SlotSelectionBottomSheet] Failed to fetch booking config:', error);
      // Generate dates with default 7 days if config fetch fails
      generateDates(null);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  useEffect(() => {
    if (currentDate) {
      fetchAvailableSlots(currentDate);
    }
  }, [currentDate, serviceId, duration]);

  const generateDates = (config: BookingConfig | null) => {
    const dateOptions: DateOption[] = [];
    const today = new Date();
    
    // Get advance days from config, default to 7 if not available
    const advanceDays = config
      ? parseInt(config.booking_advance_days || '7', 10)
      : 7;

    // Start from tomorrow (i = 1) as per web app logic
    for (let i = 1; i <= advanceDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateStr = date.toISOString().split('T')[0];
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateNum = date.getDate();
      const month = date.toLocaleDateString('en-US', { month: 'short' });

      dateOptions.push({
        date: dateStr,
        displayDate: `${dateNum} ${month}`,
        displayDay: day,
      });
    }

    setDates(dateOptions);
    if (!currentDate && dateOptions.length > 0) {
      setCurrentDate(dateOptions[0].date);
    }
  };

  const fetchAvailableSlots = async (date: string) => {
    setIsLoadingSlots(true);
    try {
      const slots = await bookingService.getAvailableSlots(serviceId, date, duration);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('[SlotSelectionBottomSheet] Failed to fetch slots:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'N/A',
        serviceId,
        date,
        duration,
      });
      Alert.alert('Error', 'Failed to fetch available slots. Please try again.');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    onClose();
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    if (slot.is_available) {
      setCurrentSlot(slot);
    }
  };

  const handleConfirm = () => {
    if (currentSlot && currentDate) {
      onSelectSlot(currentDate, currentSlot);
      handleClose();
    }
  };

  const formatTime = (time: string | undefined) => {
    // Handle undefined or empty time
    if (!time) {
      return 'N/A';
    }
    
    // Format time string (e.g., "14:00:00" to "2:00 PM" or "14:00" to "2:00 PM")
    const timeParts = time.split(':');
    if (timeParts.length < 2) {
      return time; // Return as-is if format is unexpected
    }
    
    const hours = timeParts[0];
    const minutes = timeParts[1];
    const hour = parseInt(hours, 10);
    
    if (isNaN(hour)) {
      return time; // Return as-is if parsing fails
    }
    
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
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
          <TouchableOpacity className="flex-1" onPress={handleClose} activeOpacity={1} />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '85%',
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY }],
          }}
        >
          <SafeAreaView edges={['bottom']}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <Text className="text-xl font-semibold text-[#111928]" style={{ fontFamily: 'Inter-SemiBold' }}>
                Select Date & Time
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Text className="text-2xl text-[#6B7280]">×</Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker */}
            <View className="px-6 py-4 border-b border-[#E5E7EB]">
              <Text className="text-sm text-[#6B7280] mb-3" style={{ fontFamily: 'Inter-Medium' }}>
                Select Date
              </Text>
              {isLoadingConfig ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#055c3a" />
                  <Text className="text-sm text-[#6B7280] mt-2" style={{ fontFamily: 'Inter-Regular' }}>
                    Loading dates...
                  </Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {dates.map((dateOption) => (
                  <TouchableOpacity
                    key={dateOption.date}
                    className={`mr-3 px-4 py-3 rounded-xl border ${
                      currentDate === dateOption.date
                        ? 'border-[#055c3a] bg-[#F0FDF4]'
                        : 'border-[#E5E7EB] bg-white'
                    }`}
                    onPress={() => setCurrentDate(dateOption.date)}
                  >
                    <Text
                      className={`text-sm ${
                        currentDate === dateOption.date ? 'text-[#055c3a]' : 'text-[#6B7280]'
                      }`}
                      style={{ fontFamily: 'Inter-Medium' }}
                    >
                      {dateOption.displayDay}
                    </Text>
                    <Text
                      className={`text-base font-semibold mt-1 ${
                        currentDate === dateOption.date ? 'text-[#055c3a]' : 'text-[#111928]'
                      }`}
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      {dateOption.displayDate}
                    </Text>
                  </TouchableOpacity>
                ))}
                </ScrollView>
              )}
            </View>

            {/* Time Slots */}
            <ScrollView className="px-6 py-4" style={{ maxHeight: 350 }}>
              <Text className="text-sm text-[#6B7280] mb-3" style={{ fontFamily: 'Inter-Medium' }}>
                Available Time Slots
              </Text>

              {isLoadingSlots ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="large" color="#055c3a" />
                  <Text className="text-[#6B7280] mt-4" style={{ fontFamily: 'Inter-Regular' }}>
                    Loading available slots...
                  </Text>
                </View>
              ) : availableSlots.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                    No slots available for this date
                  </Text>
                  <Text className="text-[#9CA3AF] text-center mt-2" style={{ fontFamily: 'Inter-Regular' }}>
                    Please select another date
                  </Text>
                </View>
              ) : (
                <View className="flex-row flex-wrap">
                  {availableSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot.id}
                      className={`w-[48%] mr-[2%] mb-3 p-4 rounded-xl border ${
                        currentSlot?.id === slot.id
                          ? 'border-[#055c3a] bg-[#F0FDF4]'
                          : slot.is_available
                          ? 'border-[#E5E7EB] bg-white'
                          : 'border-[#E5E7EB] bg-[#F9FAFB]'
                      }`}
                      onPress={() => handleSelectSlot(slot)}
                      disabled={!slot.is_available}
                    >
                      <Text
                        className={`text-base font-semibold ${
                          currentSlot?.id === slot.id
                            ? 'text-[#055c3a]'
                            : slot.is_available
                            ? 'text-[#111928]'
                            : 'text-[#9CA3AF]'
                        }`}
                        style={{ fontFamily: 'Inter-SemiBold' }}
                      >
                        {formatTime(slot.start_time)}
                      </Text>
                      {!slot.is_available && (
                        <Text className="text-xs text-[#DC2626] mt-1" style={{ fontFamily: 'Inter-Regular' }}>
                          Booked
                        </Text>
                      )}
                      {slot.is_available && slot.available_workers !== undefined && (
                        <Text className="text-xs text-[#6B7280] mt-1" style={{ fontFamily: 'Inter-Regular' }}>
                          {slot.available_workers} available
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View className="px-6 pb-6 pt-4 border-t border-[#E5E7EB]">
              <Button
                label="Confirm Slot"
                onPress={handleConfirm}
                disabled={!currentSlot || isLoadingSlots}
              />
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
