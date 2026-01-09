import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WorkerAssignment } from '../../../services';
import Button from '../../../components/ui/Button';

interface WorkerAssignmentBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  assignment: WorkerAssignment | null;
  onCompleteWork: (assignmentId: number) => void;
  onMessageCustomer: (assignment: WorkerAssignment) => void;
}

export default function WorkerAssignmentBottomSheet({
  visible,
  onClose,
  assignment,
  onCompleteWork,
  onMessageCustomer,
}: WorkerAssignmentBottomSheetProps) {
  const translateY = useRef(new Animated.Value(1000)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 1000,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  const openGoogleMaps = async () => {
    if (!assignment) return;

    try {
      const address = assignment.booking.address;
      if (!address) {
        Alert.alert('Error', 'Customer address not available');
        return;
      }

      // Parse address to get coordinates
      const addressObj = JSON.parse(address);
      if (!addressObj.latitude || !addressObj.longitude) {
        Alert.alert('Error', 'Customer location coordinates not available');
        return;
      }

      const destination = `${addressObj.latitude},${addressObj.longitude}`;

      // Use navigation URLs that auto-start turn-by-turn navigation
      const googleMapsUrl = Platform.select({
        // For iOS: use comgooglemaps with navigate parameter to auto-start
        ios: `comgooglemaps://?daddr=${destination}&directionsmode=driving&navigate=yes`,
        // For Android: google.navigation automatically starts navigation
        android: `google.navigation:q=${destination}&mode=d`,
      });

      // Fallback to web URL if Google Maps app is not installed
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving&dir_action=navigate`;

      // Check if Google Maps app is available
      const canOpen = googleMapsUrl ? await Linking.canOpenURL(googleMapsUrl) : false;

      if (canOpen && googleMapsUrl) {
        await Linking.openURL(googleMapsUrl);
      } else {
        // Fallback to web browser
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('[WorkerAssignmentBottomSheet] Error opening Google Maps:', error);
      Alert.alert('Error', 'Unable to open Google Maps. Please make sure it is installed.');
    }
  };

  const handleCompleteWork = () => {
    if (!assignment) return;

    Alert.alert(
      'Complete Work',
      'Are you sure you want to mark this work as completed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Complete',
          style: 'default',
          onPress: () => {
            onCompleteWork(assignment.ID);
            onClose();
          },
        },
      ]
    );
  };

  const handleMessageCustomer = () => {
    if (!assignment) return;
    onMessageCustomer(assignment);
    onClose();
  };

  const formatAddress = (addressString?: string) => {
    if (!addressString) return 'No address provided';

    try {
      const addressObj = JSON.parse(addressString);
      const parts = [];

      if (addressObj.house_number) parts.push(addressObj.house_number);
      if (addressObj.address) parts.push(addressObj.address);
      if (addressObj.landmark) parts.push(addressObj.landmark);
      if (addressObj.city) parts.push(addressObj.city);
      if (addressObj.state) parts.push(addressObj.state);
      if (addressObj.postal_code) parts.push(addressObj.postal_code);

      return parts.join(', ');
    } catch {
      return addressString;
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  if (!assignment) return null;

  const { booking } = assignment;
  const isCompleted = assignment.status === 'completed';

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) + ' at ' + date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
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
            maxHeight: '70%',
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {(visible || translateY._value < 1000) && (
            <SafeAreaView edges={['bottom']} className="flex-1">
              {/* Header */}
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                <View className="flex-1">
                  <Text
                    className="text-lg font-bold text-[#111928]"
                    style={{ fontFamily: 'Inter-Bold' }}
                  >
                    {isCompleted ? 'Completed Assignment' : 'Assignment Details'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  className="ml-4 p-2 -mr-2"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="#111928" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView className="flex-1 px-6 py-4">
                {/* Completion Status Badge (if completed) */}
                {isCompleted && (
                  <View className="mb-4 bg-[#D1FAE5] border border-[#6EE7B7] rounded-lg p-4">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                      <Text
                        className="text-base font-bold text-[#059669] ml-2"
                        style={{ fontFamily: 'Inter-Bold' }}
                      >
                        Work Completed
                      </Text>
                    </View>
                    {assignment.completed_at && (
                      <Text
                        className="text-sm text-[#065F46]"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        {formatDateTime(assignment.completed_at)}
                      </Text>
                    )}
                  </View>
                )}

                {/* Service Name */}
                <View className="mb-4">
                  <Text
                    className="text-sm text-[#6B7280] mb-1"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
                    Service
                  </Text>
                  <Text
                    className="text-base font-semibold text-[#111928]"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    {booking.service?.name || 'Service'}
                  </Text>
                </View>

                {/* Customer Info */}
                <View className="mb-4">
                  <Text
                    className="text-sm text-[#6B7280] mb-1"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
                    Customer
                  </Text>
                  <Text
                    className="text-base font-semibold text-[#111928]"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    {booking.contact_person || booking.user?.name || 'Customer'}
                  </Text>
                  {booking.contact_phone && (
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="call-outline" size={16} color="#6B7280" />
                      <Text
                        className="text-sm text-[#6B7280] ml-1"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        {booking.contact_phone}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Address */}
                <View className="mb-4">
                  <Text
                    className="text-sm text-[#6B7280] mb-1"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
                    Address
                  </Text>
                  <View className="flex-row items-start">
                    <Ionicons name="location-outline" size={18} color="#6B7280" className="mt-0.5" />
                    <Text
                      className="flex-1 text-sm text-[#111928] ml-2"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      {formatAddress(booking.address)}
                    </Text>
                  </View>
                </View>

                {/* Scheduled Date */}
                {booking.scheduled_date && (
                  <View className="mb-4">
                    <Text
                      className="text-sm text-[#6B7280] mb-1"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      Scheduled Date
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                      <Text
                        className="text-sm text-[#111928] ml-2"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        {formatDate(booking.scheduled_date)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Description */}
                {booking.description && (
                  <View className="mb-4">
                    <Text
                      className="text-sm text-[#6B7280] mb-1"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      Description
                    </Text>
                    <Text
                      className="text-sm text-[#111928]"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      {booking.description}
                    </Text>
                  </View>
                )}

                {/* Special Instructions */}
                {booking.special_instructions && (
                  <View className="mb-4">
                    <Text
                      className="text-sm text-[#6B7280] mb-1"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      Special Instructions
                    </Text>
                    <View className="bg-[#FEF3C7] p-3 rounded-lg">
                      <Text
                        className="text-sm text-[#92400E]"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        {booking.special_instructions}
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Action Buttons - Only show for in_progress assignments */}
              {!isCompleted && (
                <View className="px-6 py-4 border-t border-[#E5E7EB]">
                  <Button
                    label="Open in Google Maps"
                    onPress={openGoogleMaps}
                    icon={<Ionicons name="navigate" size={20} color="white" />}
                    variant="solid"
                    className="mb-3"
                  />

                  <Button
                    label="Message Customer"
                    onPress={handleMessageCustomer}
                    icon={<Ionicons name="chatbubble-outline" size={20} color="#111928" />}
                    variant="outline"
                    className="mb-3"
                  />

                  <Button
                    label="Complete Work"
                    onPress={handleCompleteWork}
                    icon={<Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />}
                    variant="outline"
                    className="border-[#10B981]"
                  />
                </View>
              )}
            </SafeAreaView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}
