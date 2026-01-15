import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Booking, TimeSlot } from '../../../types/booking';
import CalendarIcon from '../../../components/icons/CalendarIcon';
import Button from '../../../components/ui/Button';
import CancelIcon from '../../../components/icons/CancelIcon';
import PaymentMethodBottomSheet from './PaymentMethodBottomSheet';
import SlotSelectionBottomSheet from './SlotSelectionBottomSheet';
import { walletService, bookingService } from '../../../services';
import { razorpayService } from '../../../utils/razorpay';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { createOrGetConversation } from '../../../store/slices/chatSlice';

interface BookingDetailBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  booking: Booking | null;
  onPaymentSuccess?: () => void;
  onNavigateToChat?: (
    conversationId: number,
    workerInfo: {
      id: number;
      name: string;
      phone?: string;
      profileImage?: string;
    }
  ) => void;
}

export default function BookingDetailBottomSheet({
  visible,
  onClose,
  booking,
  onPaymentSuccess,
  onNavigateToChat,
}: BookingDetailBottomSheetProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(500)).current;
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showSlotSheet, setShowSlotSheet] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAcceptingQuote, setIsAcceptingQuote] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    if (visible) {
      // Fetch wallet balance when sheet opens
      fetchWalletBalance();
      
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
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 500,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
      setShowPaymentSheet(false);
    }
  }, [visible, overlayOpacity, translateY]);

  const fetchWalletBalance = async () => {
    try {
      const summary = await walletService.getWalletSummary();
      setWalletBalance(summary.current_balance);
    } catch (error) {
      setWalletBalance(0);
    }
  };

  const handlePayButtonPress = () => {
    if (isSinglePayment && !selectedDate && !selectedSlot) {
      // For single payment, show date/time selection first
      setShowSlotSheet(true);
    } else {
      // For multiple segments or if date/time already selected, go to payment
      setShowPaymentSheet(true);
    }
  };

  const handleSlotSelect = (date: string, slot: TimeSlot) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
    setShowSlotSheet(false);
    // After selecting slot, show payment method selection
    setShowPaymentSheet(true);
  };

  const handlePayment = async (method: 'razorpay' | 'wallet') => {
    if (!booking) return;
    
    setIsProcessingPayment(true);
    const bookingId = booking.id || booking.ID;
    
    try {
      if (method === 'wallet') {
        // For wallet payment, we need scheduled date/time for single payment
        // For segmented payment, we might not need it
        if (isSinglePayment) {
          // Single payment requires scheduling - show date/time picker or use current booking date
          // For now, if booking has scheduled date/time, use it, otherwise show error
          const scheduledDate = displayDate ? new Date(displayDate).toISOString().split('T')[0] : null;
          const scheduledTime = displayTime ? displayTime.substring(0, 5) : null;
          
          if (!scheduledDate || !scheduledTime) {
            Alert.alert(
              'Scheduling Required',
              'Please schedule the service date and time before making payment. You can schedule it from the booking details.',
              [{ text: 'OK' }]
            );
            setIsProcessingPayment(false);
            return;
          }
          
          await bookingService.processQuoteWalletPayment(
            bookingId,
            remainingAmount,
            scheduledDate,
            scheduledTime
          );
        } else {
          // Segmented payment - no scheduling required, just pay the segment
          // For segmented payments, we need to find the next pending segment (sorted by segment_number)
          const sortedPendingSegments = paymentSegments
            .filter((seg: any) => seg.status === 'pending')
            .sort((a: any, b: any) => (a.segment_number || 0) - (b.segment_number || 0));
          if (sortedPendingSegments.length === 0) {
            Alert.alert('No Pending Segments', 'All payment segments have been paid.');
            setIsProcessingPayment(false);
            return;
          }

          // Pay the next pending segment using the segment payment API
          const nextSegment = sortedPendingSegments[0];
          await bookingService.paySegment(
            bookingId,
            nextSegment.segment_number || 1,
            nextSegment.amount,
            'wallet'
          );
        }
        
        // Refresh wallet balance
        await fetchWalletBalance();
        
        Alert.alert('Success', 'Payment processed successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setShowPaymentSheet(false);
              onClose();
              // Refresh bookings by calling parent callback if available
            },
          },
        ]);
      } else {
        // Razorpay payment
        let paymentOrder;

        if (isSegmentedPayment) {
          // For segmented payments, use paySegment API
          // Get pending segments sorted by segment_number to pay in sequence
          const sortedPendingSegments = paymentSegments
            .filter((seg: any) => seg.status === 'pending')
            .sort((a: any, b: any) => (a.segment_number || 0) - (b.segment_number || 0));
          if (sortedPendingSegments.length === 0) {
            Alert.alert('No Pending Segments', 'All payment segments have been paid.');
            setIsProcessingPayment(false);
            return;
          }

          const nextSegment = sortedPendingSegments[0];
          const segmentResponse = await bookingService.paySegment(
            bookingId,
            nextSegment.segment_number || 1,
            nextSegment.amount,
            'razorpay'
          );

          paymentOrder = (segmentResponse as any).payment_order;
        } else {
          // For single payments, use createQuotePayment API
          const scheduledDate = selectedDate || (displayDate ? new Date(displayDate).toISOString().split('T')[0] : undefined);
          const scheduledTime = selectedSlot?.start_time || (displayTime ? displayTime.substring(0, 5) : undefined);

          if (!scheduledDate || !scheduledTime) {
            Alert.alert(
              'Scheduling Required',
              'Please select date and time before making payment.',
              [{ text: 'OK', onPress: () => {
                setShowPaymentSheet(false);
                setShowSlotSheet(true);
              }}]
            );
            setIsProcessingPayment(false);
            return;
          }

          const response = await bookingService.createQuotePayment(
            bookingId,
            remainingAmount,
            scheduledDate,
            scheduledTime,
            undefined
          );

          paymentOrder = response.payment_order;
        }

        if (!paymentOrder) {
          throw new Error('Payment order not received');
        }

        // Close both modals before opening Razorpay to avoid modal stacking issues
        setShowPaymentSheet(false);
        onClose();

        // Wait for modals to close before opening Razorpay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Open Razorpay checkout
        const options = {
          key: paymentOrder.key_id,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          order_id: paymentOrder.id,
          name: 'Trees India',
          description: `Quote payment for ${booking.service?.name || 'booking'}`,
          prefill: {
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: { color: '#055c3a' },
        };

        // Open Razorpay checkout
        await razorpayService.openCheckout(
          options,
          async (razorpayData) => {
            try {
              // Verify payment using the appropriate API
              if (isSegmentedPayment) {
                await bookingService.verifySegmentPayment(
                  bookingId,
                  razorpayData.razorpay_order_id,
                  razorpayData.razorpay_payment_id,
                  razorpayData.razorpay_signature
                );
              } else {
                await bookingService.verifyQuotePayment(bookingId, razorpayData);
              }

              Alert.alert('Success', 'Payment verified successfully!', [
                {
                  text: 'OK',
                  onPress: () => {
                    // Sheets are already closed before opening Razorpay
                    // Just call the success callback to refresh bookings
                    onPaymentSuccess?.();
                  },
                },
              ]);
            } catch (error: any) {
              Alert.alert(
                'Verification Failed',
                error?.message || 'Failed to verify payment. Please contact support.',
                [{ text: 'OK' }]
              );
              setIsProcessingPayment(false);
            }
          },
          (error) => {
            // Reset loading state AND close payment sheet first to prevent stuck UI
            setIsProcessingPayment(false);
            setShowPaymentSheet(false);

            // Check if payment was cancelled (multiple ways it can be indicated)
            const isCancelled =
              error.code === 'PAYMENT_CANCELLED' ||
              error.code === '2' ||
              (error.code === 'UNKNOWN_ERROR' && error.description?.toLowerCase().includes('cancel')) ||
              // Android-specific cancellation: BAD_REQUEST_ERROR with undefined description or payment_error reason
              (error.code === 'BAD_REQUEST_ERROR' &&
               (error.description === 'undefined' || error.reason === 'payment_error'));

            // Handle different error cases
            if (isCancelled) {
              // User cancelled payment - close sheet
              Alert.alert(
                'Payment Cancelled',
                'You cancelled the payment.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      onClose(); // Close the bottom sheet
                    },
                  },
                ]
              );
            } else {
              Alert.alert(
                'Payment Failed',
                error.description || 'Payment failed. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Payment Failed',
        error?.message || 'Failed to process payment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleAcceptQuote = async () => {
    if (!booking) return;

    setIsAcceptingQuote(true);
    const bookingId = booking.id || booking.ID;

    try {
      await bookingService.acceptQuote(bookingId);

      Alert.alert('Success', 'Quote accepted successfully! You can now proceed with payment.', [
        {
          text: 'OK',
          onPress: () => {
            onClose();
            onPaymentSuccess?.(); // Refresh bookings to show updated status
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Failed to Accept Quote',
        error?.message || 'Failed to accept quote. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAcceptingQuote(false);
    }
  };

  if (!booking) {
    return null;
  }

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
      return dateString;
    }
  };

  const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return '';
    try {
      const date = new Date(`2000-01-01T${timeString}`);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  // For inquiry bookings, use quote_duration if available, otherwise use service duration or default
  // For inquiry services, duration might be in format like "90-180 days" which is not valid for slots API
  // So we use quote_duration from booking or a default duration
  const getSlotDuration = (): string | undefined => {
    const bookingData = booking as any;
    const isInquiry = bookingData.booking_type === 'inquiry' || booking.is_inquiry === true;

    if (isInquiry && bookingData.quote_duration) {
      // Use quote_duration if available (e.g., "2h", "3h", etc.)
      return bookingData.quote_duration;
    }
    // For fixed price services, use service duration
    if (booking.service?.duration) {
      const serviceDuration = booking.service.duration;
      // If duration contains "days" or is not in standard format, use default
      if (serviceDuration.includes('days') || serviceDuration.includes('day')) {
        return '2h'; // Default duration for inquiry services
      }
      return serviceDuration;
    }
    return undefined; // Return undefined to let API use service default
  };

  const formatBookingId = (booking: Booking): string => {
    const bookingId = booking.id || booking.ID;
    const bookingData = booking as any;
    if (bookingData.booking_reference) {
      return bookingData.booking_reference;
    }
    if (bookingId) {
      const date = new Date(booking.created_at || Date.now());
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `BK${year}${month}${day}${hours}${minutes}${seconds}`;
    }
    return 'N/A';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return '#00a871';
      case 'pending':
        return '#F59E0B';
      case 'in_progress':
        return '#3B82F6';
      case 'assigned':
        return '#8B5CF6';
      case 'quote_provided':
        return '#3B82F6';
      case 'quote_accepted':
        return '#10B981';
      case 'partially_paid':
        return '#F59E0B'; // Amber/Orange for partial payment
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'assigned':
        return 'Worker Assigned';
      case 'quote_provided':
        return 'Quote Provided';
      case 'quote_accepted':
        return 'Quote Accepted';
      case 'partially_paid':
        return 'Partially Paid';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const bookingData = booking as any;
  const isInquiry = bookingData.booking_type === 'inquiry' || booking.is_inquiry === true;
  const displayDate = booking.booking_date || bookingData.scheduled_date;
  const displayTime = booking.start_time || bookingData.scheduled_time;
  
  const contactInfo = bookingData.contact || {};
  const contactPerson = booking.contact_person || contactInfo.contact_person;
  const contactPhone = booking.contact_phone || contactInfo.contact_phone;
  const description = booking.description || contactInfo.description;
  
  const paymentInfo = bookingData.payment || {};
  const totalAmount = booking.total_amount || paymentInfo.amount;
  const paymentStatus = booking.payment_status || paymentInfo.status;
  
  // Handle quote info for inquiry bookings
  const quoteAmount = bookingData.quote_amount;
  const quoteProvidedAt = bookingData.quote_provided_at;
  const hasQuote = quoteAmount != null && quoteAmount > 0;
  const paymentSegments = bookingData.payment_segments || [];
  const isSegmentedPayment = paymentSegments.length > 1;
  const isSinglePayment = paymentSegments.length === 1;
  
  // Calculate remaining amount to pay
  const paidSegments = paymentSegments.filter((seg: any) => seg.status === 'paid');
  const paidAmount = paidSegments.reduce((sum: number, seg: any) => sum + (seg.amount || 0), 0);

  // Check if payment is fully completed
  const bookingStatus = (bookingData as any).status || booking.status;
  const paymentStatusStr = String(paymentStatus || '');

  // For segmented payments, ONLY check if all segments are paid (ignore payment_status)
  // For non-segmented payments, check payment_status, booking status, or paid amount
  let isPaymentCompleted: boolean;
  if (isSegmentedPayment) {
    // For segmented payments, payment is only complete when ALL segments are paid
    isPaymentCompleted = paymentSegments.every((seg: any) => seg.status === 'paid');
  } else {
    // For non-segmented payments, use traditional checks
    isPaymentCompleted = paymentStatusStr === 'completed' ||
                         paymentStatusStr === 'paid' ||
                         (bookingStatus === 'confirmed' || bookingStatus === 'assigned') ||
                         (hasQuote && paidAmount >= quoteAmount);
  }

  // Get the next pending segment (sorted by segment_number)
  const pendingSegments = paymentSegments
    .filter((seg: any) => seg.status === 'pending')
    .sort((a: any, b: any) => (a.segment_number || 0) - (b.segment_number || 0));
  const nextPendingSegment = pendingSegments[0];

  // Calculate remaining amount - if payment is completed, remaining should be 0
  // For segmented payments, show the next pending segment's amount
  // For non-segmented payments, show the total remaining amount
  const remainingAmount = (hasQuote && !isPaymentCompleted)
    ? (isSegmentedPayment && nextPendingSegment
        ? nextPendingSegment.amount
        : Math.max(0, quoteAmount - paidAmount))
    : 0;

  // Determine which button to show based on booking status
  const shouldShowAcceptQuoteButton = hasQuote && bookingStatus === 'quote_provided';
  const shouldShowPayButton = hasQuote && remainingAmount > 0 && (bookingStatus === 'quote_accepted' || bookingStatus === 'partially_paid');

  // Handle worker assignment
  let workerName: string | undefined;
  let workerPhone: string | undefined;
  let workerAssignmentStatus: string | undefined;

  try {
    const workerAssignment = bookingData.worker_assignment;
    if (workerAssignment && typeof workerAssignment === 'object' && workerAssignment !== null) {
      workerAssignmentStatus = workerAssignment.status;
      const worker = workerAssignment.worker || workerAssignment;
      if (worker && typeof worker === 'object' && worker !== null) {
        workerName = worker.name || worker.contact_info?.name || worker.contact_person_name || worker.Name;
        workerPhone = worker.phone || worker.contact_info?.phone || worker.contact_person_phone || worker.Phone;
      }
    }
  } catch (error) {
    // Error extracting worker assignment
  }

  const statusColor = getStatusColor(booking.status);
  const statusLabel = getStatusLabel(booking.status);

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

        {/* Floating Close Button */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: '70%',
            right: 16,
            transform: [{ translateY }],
            zIndex: 30,
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
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            minHeight: '70%',
            maxHeight: '70%',
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY }],
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header - Fixed */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <Text
              className="text-lg font-bold text-[#111928]"
              style={{ fontFamily: 'Inter-Bold' }}
            >
              Booking Details
            </Text>
          </View>

          {/* Content - Scrollable */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 16
            }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            bounces={true}
            keyboardShouldPersistTaps="handled"
          >
                {/* Service Name and Status */}
                <View className="flex-row items-start justify-between mb-4">
                  <View className="flex-1 mr-3">
                    <Text
                      className="text-xl font-bold text-[#111928] mb-2"
                      style={{ fontFamily: 'Inter-Bold' }}
                    >
                      {booking.service?.name || 'Service'}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    {isInquiry && (
                      <View className="px-2.5 py-1.5 rounded-lg bg-[#3B82F6]">
                        <Text
                          className="text-xs font-semibold text-white"
                          style={{ fontFamily: 'Inter-SemiBold' }}
                        >
                          Inquiry
                        </Text>
                      </View>
                    )}
                    <View
                      className="px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: statusColor }}
                    >
                      <Text
                        className="text-xs font-semibold text-white"
                        style={{ fontFamily: 'Inter-SemiBold' }}
                      >
                        {statusLabel}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Booking ID */}
                <View className="mb-4 pb-4 border-b border-[#E5E7EB]">
                  <Text
                    className="text-xs font-semibold text-[#6B7280] mb-1"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    BOOKING ID
                  </Text>
                  <Text
                    className="text-base text-[#111928]"
                    style={{ fontFamily: 'Inter-Medium' }}
                  >
                    {formatBookingId(booking)}
                  </Text>
                </View>

                {isInquiry ? (
                  // Inquiry Booking Details
                  <>
                    {/* Contact Info */}
                    {contactPerson && (
                      <View className="mb-4">
                        <Text
                          className="text-xs font-semibold text-[#6B7280] mb-1"
                          style={{ fontFamily: 'Inter-SemiBold' }}
                        >
                          CONTACT PERSON
                        </Text>
                        <Text
                          className="text-base text-[#111928]"
                          style={{ fontFamily: 'Inter-Medium' }}
                        >
                          {contactPerson}
                          {contactPhone && ` • ${contactPhone}`}
                        </Text>
                      </View>
                    )}

                    {/* Description */}
                    {description && (
                      <View className="mb-4">
                        <Text
                          className="text-xs font-semibold text-[#6B7280] mb-1"
                          style={{ fontFamily: 'Inter-SemiBold' }}
                        >
                          DESCRIPTION
                        </Text>
                        <Text
                          className="text-base text-[#4B5563] leading-6"
                          style={{ fontFamily: 'Inter-Regular' }}
                        >
                          {description}
                        </Text>
                      </View>
                    )}

                    {/* Quote Information */}
                    {hasQuote ? (
                      <>
                        <View className="mb-4">
                          <Text
                            className="text-xs font-semibold text-[#6B7280] mb-1"
                            style={{ fontFamily: 'Inter-SemiBold' }}
                          >
                            QUOTE AMOUNT
                          </Text>
                          <View className="flex-row items-center justify-between mb-2">
                            <Text
                              className="text-2xl font-bold text-[#00a871]"
                              style={{ fontFamily: 'Inter-Bold' }}
                            >
                              ₹{quoteAmount.toLocaleString('en-IN')}
                            </Text>
                            {paidAmount > 0 && (
                              <View className="px-2 py-1 rounded bg-[#D1FAE5]">
                                <Text
                                  className="text-xs font-semibold"
                                  style={{ fontFamily: 'Inter-SemiBold', color: '#065F46' }}
                                >
                                  Paid: ₹{paidAmount.toLocaleString('en-IN')}
                                </Text>
                              </View>
                            )}
                          </View>
                          {remainingAmount > 0 && (
                            <Text
                              className="text-sm text-[#6B7280] mb-2"
                              style={{ fontFamily: 'Inter-Regular' }}
                            >
                              Remaining: ₹{remainingAmount.toLocaleString('en-IN')}
                            </Text>
                          )}
                          {isSegmentedPayment && (
                            <Text
                              className="text-xs text-[#6B7280] mb-2"
                              style={{ fontFamily: 'Inter-Regular' }}
                            >
                              Segmented Payment ({paymentSegments.length} segments)
                            </Text>
                          )}
                          {isSinglePayment && (
                            <Text
                              className="text-xs text-[#6B7280] mb-2"
                              style={{ fontFamily: 'Inter-Regular' }}
                            >
                              Single Payment
                            </Text>
                          )}
                          {quoteProvidedAt && (
                            <Text
                              className="text-xs text-[#6B7280]"
                              style={{ fontFamily: 'Inter-Regular' }}
                            >
                              Quote provided on {formatDate(quoteProvidedAt)}
                            </Text>
                          )}
                        </View>

                        {/* Segment Breakdown - Only for segmented payments */}
                        {isSegmentedPayment && paymentSegments.length > 0 && (
                          <View className="mb-4">
                            <Text
                              className="text-xs font-semibold text-[#6B7280] mb-3"
                              style={{ fontFamily: 'Inter-SemiBold' }}
                            >
                              PAYMENT SEGMENTS
                            </Text>
                            <View>
                              {paymentSegments.map((segment: any, index: number) => {
                                const isPaid = segment.status === 'paid';
                                const isPending = segment.status === 'pending';
                                return (
                                  <View
                                    key={segment.id || segment.segment_number || index}
                                    className={`bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-3 ${index < paymentSegments.length - 1 ? 'mb-2' : ''}`}
                                  >
                                    <View className="flex-row items-center justify-between">
                                      <View className="flex-1">
                                        <Text
                                          className="text-sm font-semibold text-[#111928] mb-1"
                                          style={{ fontFamily: 'Inter-SemiBold' }}
                                        >
                                          Segment {segment.segment_number || index + 1}
                                        </Text>
                                        <Text
                                          className="text-lg font-bold text-[#00a871]"
                                          style={{ fontFamily: 'Inter-Bold' }}
                                        >
                                          ₹{segment.amount?.toLocaleString('en-IN') || '0'}
                                        </Text>
                                      </View>
                                      <View
                                        className={`px-3 py-1.5 rounded-lg ${
                                          isPaid
                                            ? 'bg-[#D1FAE5]'
                                            : isPending
                                            ? 'bg-[#FEF3C7]'
                                            : 'bg-[#FEE2E2]'
                                        }`}
                                      >
                                        <Text
                                          className={`text-xs font-semibold ${
                                            isPaid
                                              ? 'text-[#065F46]'
                                              : isPending
                                              ? 'text-[#92400E]'
                                              : 'text-[#991B1B]'
                                          }`}
                                          style={{ fontFamily: 'Inter-SemiBold' }}
                                        >
                                          {isPaid ? 'PAID' : isPending ? 'PENDING' : 'OVERDUE'}
                                        </Text>
                                      </View>
                                    </View>
                                    {segment.paid_at && (
                                      <Text
                                        className="text-xs text-[#6B7280] mt-2"
                                        style={{ fontFamily: 'Inter-Regular' }}
                                      >
                                        Paid on {formatDate(String(segment.paid_at))}
                                      </Text>
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                          </View>
                        )}
                      </>
                    ) : (
                      <View className="mb-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-4 py-3">
                        <Text
                          className="text-xs font-semibold text-[#6B7280] mb-1.5"
                          style={{ fontFamily: 'Inter-SemiBold' }}
                        >
                          NOTE
                        </Text>
                        <Text
                          className="text-sm text-[#4B5563] leading-5"
                          style={{ fontFamily: 'Inter-Regular' }}
                        >
                          Please wait for TreesIndia to provide you the quote. TreesIndia support might contact you regarding your booking.
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  // Fixed Price Booking Details
                  <>
                    {/* Service Date */}
                    {displayDate && (
                      <View className="mb-4">
                        <Text
                          className="text-xs font-semibold text-[#6B7280] mb-1"
                          style={{ fontFamily: 'Inter-SemiBold' }}
                        >
                          SERVICE DATE
                        </Text>
                        <View className="flex-row items-center">
                          <CalendarIcon size={16} color="#111928" />
                          <Text
                            className="text-base text-[#111928] ml-2"
                            style={{ fontFamily: 'Inter-Medium' }}
                          >
                            {formatDate(displayDate)}
                            {displayTime && ` • ${formatTime(displayTime)}`}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Worker Assignment */}
                    {workerName && (
                      <View className="mb-4">
                        <Text
                          className="text-xs font-semibold text-[#6B7280] mb-1"
                          style={{ fontFamily: 'Inter-SemiBold' }}
                        >
                          WORKER ASSIGNED
                        </Text>
                        <Text
                          className="text-base text-[#111928]"
                          style={{ fontFamily: 'Inter-Medium' }}
                        >
                          {workerName}
                          {workerPhone && ` • ${workerPhone}`}
                        </Text>
                      </View>
                    )}

                    {/* Amount & Payment Status */}
                    {totalAmount != null && totalAmount > 0 && (
                      <View className="mb-4">
                        <Text
                          className="text-xs font-semibold text-[#6B7280] mb-1"
                          style={{ fontFamily: 'Inter-SemiBold' }}
                        >
                          TOTAL AMOUNT
                        </Text>
                        <View className="flex-row items-center justify-between">
                          <Text
                            className="text-2xl font-bold text-[#00a871]"
                            style={{ fontFamily: 'Inter-Bold' }}
                          >
                            ₹{totalAmount.toLocaleString('en-IN')}
                          </Text>
                          {((paymentStatus as string) === 'paid' || (paymentStatus as string) === 'completed') && (
                            <View
                              className="px-3 py-1.5 rounded-lg"
                              style={{
                                backgroundColor: '#D1FAE5',
                              }}
                            >
                              <Text
                                className="text-xs font-bold"
                                style={{
                                  fontFamily: 'Inter-Bold',
                                  color: '#065F46',
                                }}
                              >
                                PAID
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </>
                )}

                {/* Address */}
                {booking.address && (
                  <View className="mb-4 pb-4 border-b border-[#E5E7EB]">
                    <Text
                      className="text-xs font-semibold text-[#6B7280] mb-1"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      SERVICE ADDRESS
                    </Text>
                    <Text
                      className="text-base text-[#111928] leading-6"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      {booking.address.name && `${booking.address.name}\n`}
                      {booking.address.house_number && `${booking.address.house_number}, `}
                      {booking.address.address}
                      {booking.address.landmark && `, ${booking.address.landmark}`}
                      {`\n${booking.address.city}, ${booking.address.state} - ${booking.address.postal_code}`}
                    </Text>
                  </View>
                )}

                {/* Created Date */}
                {booking.created_at && (
                  <View className="mb-4">
                    <Text
                      className="text-xs font-semibold text-[#6B7280] mb-1"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      BOOKED ON
                    </Text>
                    <Text
                      className="text-base text-[#111928]"
                      style={{ fontFamily: 'Inter-Medium' }}
                    >
                      {formatDate(booking.created_at)}
                    </Text>
                  </View>
                )}
          </ScrollView>

          {/* Action Buttons - Fixed at bottom */}
          {(shouldShowAcceptQuoteButton || shouldShowPayButton || workerName) && (
            <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'white' }}>
              <View className="px-6 pt-4 pb-12 border-t border-[#E5E7EB]">
                {shouldShowAcceptQuoteButton && (
                  <Button
                    label="Accept Quote"
                    onPress={handleAcceptQuote}
                    variant="solid"
                    className={workerName ? "mb-3" : ""}
                    isLoading={isAcceptingQuote}
                  />
                )}
                {shouldShowPayButton && (
                  <Button
                    label={`Pay ₹${remainingAmount.toLocaleString('en-IN')}`}
                    onPress={handlePayButtonPress}
                    variant="solid"
                    className={workerName ? "mb-3" : ""}
                  />
                )}
                {workerName && (
                  <>
                    <Button
                      label="Chat with Worker"
                      onPress={async () => {
                        try {
                          // Extract worker information
                          const workerAssignment = (booking as { worker_assignment?: {
                            worker_id?: number;
                            worker?: {
                              ID?: number;
                              id?: number;
                              name?: string;
                              phone?: string;
                              profile_image_url?: string;
                            };
                          }}).worker_assignment;
                          const worker = workerAssignment?.worker;
                          const workerId = worker?.id || worker?.ID;

                          // Validate required data
                          if (!workerId) {
                            Alert.alert('Error', 'Worker information not available');
                            return;
                          }

                          if (!user?.id) {
                            Alert.alert('Error', 'User not logged in');
                            return;
                          }

                          if (!onNavigateToChat) {
                            Alert.alert('Error', 'Navigation not available');
                            return;
                          }

                          // Create or get conversation
                          const result = await dispatch(
                            createOrGetConversation({
                              userId1: user.id,
                              userId2: workerId,
                            })
                          ).unwrap();

                          // Close bottom sheet first
                          onClose();

                          // Wait a bit for animation
                          setTimeout(() => {
                            onNavigateToChat(result.conversation.id, {
                              id: workerId,
                              name: worker?.name || workerName,
                              phone: worker?.phone,
                              profileImage: worker?.profile_image_url,
                            });
                          }, 300);
                        } catch (error) {
                          Alert.alert(
                            'Error',
                            error instanceof Error
                              ? error.message
                              : 'Failed to open chat. Please try again.'
                          );
                        }
                      }}
                      variant={(shouldShowAcceptQuoteButton || shouldShowPayButton) ? 'outline' : 'solid'}
                      className="mb-2"
                    />
                  </>
                )}
              </View>
            </SafeAreaView>
          )}
        </Animated.View>
      </View>

      {/* Slot Selection Bottom Sheet - Only for single payment */}
      {isSinglePayment && booking.service && (
        <SlotSelectionBottomSheet
          visible={showSlotSheet}
          onClose={() => setShowSlotSheet(false)}
          onSelectSlot={handleSlotSelect}
          serviceId={booking.service.id || booking.service.ID || 0}
          duration={getSlotDuration()}
          selectedDate={selectedDate || undefined}
          selectedSlotId={selectedSlot?.id}
        />
      )}

      {/* Payment Method Bottom Sheet */}
      <PaymentMethodBottomSheet
        visible={showPaymentSheet}
        onClose={() => setShowPaymentSheet(false)}
        onSelectMethod={handlePayment}
        amount={remainingAmount}
        walletBalance={walletBalance}
      />

    </Modal>
  );
}

