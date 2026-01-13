import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookingService } from '../../../services';
import { TimeSlot, BookingConfig } from '../../../types/booking';
import Button from '../../../components/ui/Button';
import CancelIcon from '../../../components/icons/CancelIcon';

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
  const [bookingConfig, setBookingConfig] = useState<BookingConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fetchBookingConfig();

      // Animate in
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, overlayOpacity, slideAnim]);

  const fetchBookingConfig = async () => {
    setIsLoadingConfig(true);
    try {
      const config = await bookingService.getBookingConfig();
      setBookingConfig(config);
      generateDates(config);
    } catch (error) {
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
      Alert.alert('Error', 'Failed to fetch available slots. Please try again.');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleClose = () => {
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

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  if (!visible) return null;

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
            opacity: overlayOpacity,
          }}
          className="absolute inset-0 bg-black/50"
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Floating Close Button */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: '70%',
            right: 16,
            transform: [{ translateY }],
            zIndex: 50,
          }}
        >
          <TouchableOpacity
            onPress={handleClose}
            className="w-12 h-12 bg-white rounded-full items-center justify-center"
            style={{
              marginTop: -56,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <CancelIcon size={24} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={{
            transform: [{ translateY }],
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl min-h-[70%] max-h-[70%]"
        >
          {/* Header - Fixed */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <Text
              className="text-lg font-semibold text-[#111928]"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              Select Date & Time
            </Text>
          </View>

          {/* Date Picker - Fixed */}
          <View className="px-6 py-4 border-b border-[#E5E7EB]">
            <Text
              className="text-sm text-[#6B7280] mb-3"
              style={{ fontFamily: 'Inter-Medium' }}
            >
              Select Date
            </Text>
            {isLoadingConfig ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#055c3a" />
                <Text
                  className="text-sm text-[#6B7280] mt-2"
                  style={{ fontFamily: 'Inter-Regular' }}
                >
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

          {/* Time Slots - Scrollable */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 16,
            }}
            showsVerticalScrollIndicator={true}
          >
            <Text
              className="text-sm text-[#6B7280] mb-3"
              style={{ fontFamily: 'Inter-Medium' }}
            >
              Available Time Slots
            </Text>

            {isLoadingSlots ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#055c3a" />
                <Text
                  className="text-[#6B7280] mt-4"
                  style={{ fontFamily: 'Inter-Regular' }}
                >
                  Loading available slots...
                </Text>
              </View>
            ) : availableSlots.length === 0 ? (
              <View className="py-8 items-center">
                <Text
                  className="text-[#6B7280]"
                  style={{ fontFamily: 'Inter-Regular' }}
                >
                  No slots available for this date
                </Text>
                <Text
                  className="text-[#9CA3AF] text-center mt-2"
                  style={{ fontFamily: 'Inter-Regular' }}
                >
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
                      <Text
                        className="text-xs text-[#DC2626] mt-1"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        Booked
                      </Text>
                    )}
                    {slot.is_available && slot.available_workers !== undefined && (
                      <Text
                        className="text-xs text-[#6B7280] mt-1"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        {slot.available_workers} available
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer - Fixed at bottom */}
          <SafeAreaView
            edges={['bottom']}
            style={{ backgroundColor: 'white' }}
          >
            <View className="px-6 pt-4 pb-12 border-t border-[#E5E7EB]">
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
