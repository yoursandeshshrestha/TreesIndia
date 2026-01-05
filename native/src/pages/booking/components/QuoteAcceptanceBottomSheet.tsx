import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Booking } from '../../../types/booking';
import Button from '../../../components/ui/Button';
import { bookingService, walletService } from '../../../services';
import { useAppSelector } from '../../../store/hooks';
import PaymentMethodBottomSheet from './PaymentMethodBottomSheet';
import SlotSelectionBottomSheet from './SlotSelectionBottomSheet';
import { razorpayService } from '../../../utils/razorpay';
import PhoneIcon from '../../../components/icons/PhoneIcon';
import LocationIcon from '../../../components/icons/LocationIcon';

interface QuoteAcceptanceBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSuccess: () => void;
}

type Step = 'date' | 'payment';

export default function QuoteAcceptanceBottomSheet({
  visible,
  onClose,
  booking,
  onSuccess,
}: QuoteAcceptanceBottomSheetProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [currentStep, setCurrentStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showSlotSheet, setShowSlotSheet] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset state when opening
      setCurrentStep('date');
      setSelectedDate(null);
      setSelectedSlot(null);
      setShowPaymentSheet(false);
      setShowSlotSheet(false);
      
      // Fetch wallet balance
      fetchWalletBalance();
      
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

  const fetchWalletBalance = async () => {
    setIsLoadingWallet(true);
    try {
      const summary = await walletService.getWalletSummary();
      setWalletBalance(summary.current_balance || 0);
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleSlotSelect = (date: string, slot: any) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
    setShowSlotSheet(false);
    setCurrentStep('payment');
  };

  const handlePayment = async (method: 'razorpay' | 'wallet') => {
    if (!booking) return;
    
    setIsProcessingPayment(true);
    const bookingId = booking.id || booking.ID;
    if (!bookingId) {
      Alert.alert('Error', 'Invalid booking ID');
      setIsProcessingPayment(false);
      return;
    }

    try {
      const bookingData = booking as any;
      const paymentSegments = bookingData.payment_segments || [];
      const isSegmentedPayment = paymentSegments.length > 1;
      const isSinglePayment = paymentSegments.length === 1;
      
      // For single payment wallet payments, we need scheduled date and time
      if (method === 'wallet' && isSinglePayment && (!selectedDate || !selectedSlot)) {
        Alert.alert(
          'Date & Time Required',
          'Please select a date and time slot before proceeding with payment.'
        );
        setIsProcessingPayment(false);
        return;
      }

      // Get the amount to pay
      const paidSegments = paymentSegments.filter((seg: any) => seg.status === 'paid');
      const paidAmount = paidSegments.reduce((sum: number, seg: any) => sum + (seg.amount || 0), 0);
      const quoteAmount = bookingData.quote_amount || 0;
      const remainingAmount = quoteAmount - paidAmount;
      
      // For segmented payments, get the next pending segment
      const nextPendingSegment = isSegmentedPayment 
        ? paymentSegments.find((seg: any) => seg.status === 'pending')
        : null;

      if (method === 'wallet') {
        if (isSinglePayment) {
          // Single payment - requires date/time, pay full remaining amount
          const slotTime = selectedSlot?.start_time || selectedSlot?.time;
          if (!slotTime) {
            Alert.alert('Error', 'Invalid time slot selected');
            setIsProcessingPayment(false);
            return;
          }
          
          await bookingService.processQuoteWalletPayment(
            bookingId,
            remainingAmount,
            selectedDate!,
            slotTime
          );
        } else {
          // Segmented payment - no date/time required, use segment payment endpoint
          if (!nextPendingSegment) {
            throw new Error('No pending payment segment found');
          }
          
          await bookingService.paySegment(
            bookingId,
            nextPendingSegment.segment_number || 1,
            nextPendingSegment.amount,
            'wallet'
          );
        }
        
        Alert.alert(
          'Payment Successful',
          'Your payment has been processed successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                onSuccess();
              },
            },
          ]
        );
      } else {
        // Razorpay payment
        if (isSegmentedPayment) {
          // Segmented payment - use segment payment endpoint (no date/time)
          if (!nextPendingSegment) {
            throw new Error('No pending payment segment found');
          }
          
          // Create segment payment order
          const segmentResponse = await bookingService.paySegment(
            bookingId,
            nextPendingSegment.segment_number || 1,
            nextPendingSegment.amount,
            'razorpay'
          );
          
          if (!segmentResponse.data?.payment_order) {
            throw new Error('Payment order not received');
          }
          
          const paymentOrder = segmentResponse.data.payment_order;
          
          // Open Razorpay checkout
          const options = {
            key: paymentOrder.key_id,
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            order_id: paymentOrder.id,
            name: 'Trees India',
            description: `Segment payment for ${booking.service?.name || 'booking'}`,
            prefill: {
              email: user?.email || '',
              contact: user?.phone || '',
            },
            theme: { color: '#055c3a' },
          };
          
          await razorpayService.openCheckout(
            options,
            async (razorpayData) => {
              try {
                // Verify segment payment
                await bookingService.verifySegmentPayment(
                  bookingId,
                  razorpayData.razorpay_order_id,
                  razorpayData.razorpay_payment_id,
                  razorpayData.razorpay_signature
                );
                
                Alert.alert(
                  'Payment Successful',
                  'Your payment has been processed successfully.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        onSuccess();
                      },
                    },
                  ]
                );
              } catch (error: any) {
                console.error('Payment verification error:', error);
                Alert.alert(
                  'Payment Error',
                  error?.message || 'Failed to verify payment. Please contact support.'
                );
                setIsProcessingPayment(false);
              }
            },
            (error) => {
              console.error('Razorpay error:', error);
              Alert.alert(
                'Payment Error',
                error?.description || 'Payment was cancelled or failed.'
              );
              setIsProcessingPayment(false);
            }
          );
        } else {
          // Single payment - requires date/time, use quote payment endpoint
          const scheduledDate = selectedDate;
          const scheduledTime = selectedSlot?.start_time || selectedSlot?.time;
          
          if (!scheduledDate || !scheduledTime) {
            Alert.alert(
              'Date & Time Required',
              'Please select a date and time slot before proceeding with payment.'
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
          
          if (!response.payment_order) {
            throw new Error('Payment order not received');
          }
          
          const paymentOrder = response.payment_order;
          
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
          
          await razorpayService.openCheckout(
            options,
            async (razorpayData) => {
              try {
                // Verify payment
                await bookingService.verifyQuotePayment(bookingId, razorpayData);
                
                Alert.alert(
                  'Payment Successful',
                  'Your payment has been processed successfully.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        onSuccess();
                      },
                    },
                  ]
                );
              } catch (error: any) {
                console.error('Payment verification error:', error);
                Alert.alert(
                  'Payment Error',
                  error?.message || 'Failed to verify payment. Please contact support.'
                );
                setIsProcessingPayment(false);
              }
            },
            (error) => {
              console.error('Razorpay error:', error);
              Alert.alert(
                'Payment Error',
                error?.description || 'Payment was cancelled or failed.'
              );
              setIsProcessingPayment(false);
            }
          );
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error?.message || 'Failed to process payment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessingPayment(false);
      setShowPaymentSheet(false);
    }
  };

  if (!booking) return null;

  const bookingData = booking as any;
  const isInquiry = bookingData.booking_type === 'inquiry' || booking.is_inquiry === true;
  const quoteAmount = bookingData.quote_amount || 0;
  const paymentSegments = bookingData.payment_segments || [];
  const isSegmentedPayment = paymentSegments.length > 1;
  const isSinglePayment = paymentSegments.length === 1;
  
  const paidSegments = paymentSegments.filter((seg: any) => seg.status === 'paid');
  const paidAmount = paidSegments.reduce((sum: number, seg: any) => sum + (seg.amount || 0), 0);
  const remainingAmount = quoteAmount - paidAmount;
  
  // For segmented payments, get the next pending segment amount
  const nextPendingSegment = isSegmentedPayment 
    ? paymentSegments.find((seg: any) => seg.status === 'pending')
    : null;
  const amountToPay = isSegmentedPayment && nextPendingSegment 
    ? nextPendingSegment.amount 
    : remainingAmount;
  
  const canPay = remainingAmount > 0;

  // Get contact and address info
  const contactInfo = bookingData.contact || {};
  const contactPerson = booking.contact_person || contactInfo.contact_person || contactInfo.person;
  const contactPhone = booking.contact_phone || contactInfo.contact_phone || contactInfo.phone;
  const address = bookingData.address || {};
  const addressName = address.name || 'Home';
  const addressDetails = address.address || '';
  const addressCity = address.city || '';

  // Get quote duration for slot selection
  const getSlotDuration = (): string | undefined => {
    if (bookingData.quote_duration) {
      return bookingData.quote_duration;
    }
    if (booking.service?.duration) {
      const serviceDuration = booking.service.duration;
      if (serviceDuration.includes('days') || serviceDuration.includes('day')) {
        return undefined; // Use service default
      }
      return serviceDuration;
    }
    return undefined;
  };

  const formatTime = (time?: string | null): string => {
    if (!time) return '';
    try {
      // Handle already formatted time (contains AM/PM)
      if (time.includes('AM') || time.includes('PM')) {
        return time.replace(/\s+/g, ''); // Remove spaces
      }
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      if (isNaN(hour)) return time;
      const ampm = hour >= 12 ? 'pm' : 'am';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes || '00'}${ampm}`;
    } catch {
      return time;
    }
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

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

        {/* Bottom Sheet */}
        <Animated.View
          style={{
            transform: [{ translateY }],
          }}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[70%]"
        >
          <SafeAreaView edges={['bottom']} className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <Text
                className="text-lg font-semibold text-[#111928]"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                Accept Quote
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="p-2 -mr-2"
                activeOpacity={0.7}
              >
                <Text className="text-2xl text-[#6B7280]">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="px-6 py-4 pb-8">
                {/* Contact Details - Read Only */}
                <View className="mb-4 pb-4 -mx-6 px-6 border-b border-[#E5E7EB]">
                  <View className="flex-row items-start gap-3">
                    <View className="w-8 h-8 bg-[#F3F4F6] rounded-full items-center justify-center mt-1">
                      <PhoneIcon size={16} color="#6B7280" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-xs font-semibold text-[#6B7280] mb-1"
                        style={{ fontFamily: 'Inter-SemiBold' }}
                      >
                        Send booking details to
                      </Text>
                      <Text
                        className="text-sm text-[#111928]"
                        style={{ fontFamily: 'Inter-Medium' }}
                      >
                        {contactPerson || 'N/A'}
                      </Text>
                      {contactPhone && (
                        <Text
                          className="text-sm text-[#6B7280] mt-1"
                          style={{ fontFamily: 'Inter-Regular' }}
                        >
                          {contactPhone}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Address - Read Only */}
                <View className="mb-4 pb-4 -mx-6 px-6 border-b border-[#E5E7EB]">
                  <View className="flex-row items-start gap-3">
                    <View className="w-8 h-8 bg-[#F3F4F6] rounded-full items-center justify-center mt-1">
                      <LocationIcon size={16} color="#6B7280" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-xs font-semibold text-[#6B7280] mb-1"
                        style={{ fontFamily: 'Inter-SemiBold' }}
                      >
                        Address
                      </Text>
                      <Text
                        className="text-sm text-[#111928]"
                        style={{ fontFamily: 'Inter-Medium' }}
                      >
                        {addressName}
                      </Text>
                      <Text
                        className="text-xs text-[#6B7280] mt-1"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        {addressDetails}
                        {addressCity && `, ${addressCity}`}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Quote Information */}
                <View className="mb-4">
                  <Text
                    className="text-xs font-semibold text-[#6B7280] mb-2"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    QUOTE AMOUNT
                  </Text>
                  <Text
                    className="text-2xl font-bold text-[#00a871] mb-1"
                    style={{ fontFamily: 'Inter-Bold' }}
                  >
                    ₹{quoteAmount.toLocaleString('en-IN')}
                  </Text>
                  {paidAmount > 0 && (
                    <Text
                      className="text-sm text-[#6B7280]"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      Paid: ₹{paidAmount.toLocaleString('en-IN')}
                    </Text>
                  )}
                  {remainingAmount > 0 && isSegmentedPayment && (
                    <Text
                      className="text-sm text-[#6B7280] mt-1"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      Remaining: ₹{remainingAmount.toLocaleString('en-IN')}
                    </Text>
                  )}
                  {isSegmentedPayment && (
                    <Text
                      className="text-xs text-[#6B7280] mt-2"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      Payment Type: Segmented Payment ({paymentSegments.length} segments)
                    </Text>
                  )}
                  {isSinglePayment && (
                    <Text
                      className="text-xs text-[#6B7280] mt-2"
                      style={{ fontFamily: 'Inter-Regular' }}
                    >
                      Payment Type: Single Payment
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
                            {segment.due_date && !isPaid && (
                              <Text
                                className="text-xs text-[#6B7280] mt-1"
                                style={{ fontFamily: 'Inter-Regular' }}
                              >
                                Due: {formatDate(String(segment.due_date))}
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Date/Time Selection - Only for single payment */}
                {isSinglePayment && (
                  <View className="mb-4">
                    {!selectedDate ? (
                      <>
                        <Text
                          className="text-sm font-semibold text-[#111928] mb-3"
                          style={{ fontFamily: 'Inter-SemiBold' }}
                        >
                          Select Date & Time
                        </Text>
                        <Button
                          label="Select Date & Time"
                          onPress={() => {
                            if (booking.service) {
                              setShowSlotSheet(true);
                            }
                          }}
                          variant="outline"
                          className="mb-2"
                        />
                      </>
                    ) : (
                      <View className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4 mb-2">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text
                              className="text-sm font-semibold text-[#111928] mb-1"
                              style={{ fontFamily: 'Inter-SemiBold' }}
                            >
                              {formatDate(selectedDate)}
                            </Text>
                            <Text
                              className="text-sm text-[#6B7280]"
                              style={{ fontFamily: 'Inter-Medium' }}
                            >
                              {selectedSlot?.start_time 
                                ? formatTime(selectedSlot.start_time) 
                                : selectedSlot?.time 
                                  ? formatTime(selectedSlot.time) 
                                  : 'N/A'}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedDate(null);
                              setSelectedSlot(null);
                              setCurrentStep('date');
                            }}
                            className="ml-4"
                          >
                            <Text
                              className="text-sm text-[#055c3a] font-semibold"
                              style={{ fontFamily: 'Inter-SemiBold' }}
                            >
                              Change
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Payment Button */}
                {canPay && (
                  <View className="mt-4 pb-6">
                    {isSinglePayment && !selectedDate && (
                      <Text
                        className="text-xs text-[#B3261E] mb-2 text-center"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        Please select date and time before proceeding
                      </Text>
                    )}
                    <Button
                      label={`Pay ₹${amountToPay.toLocaleString('en-IN')}`}
                      onPress={() => {
                        if (isSinglePayment && !selectedDate) {
                          Alert.alert(
                            'Date & Time Required',
                            'Please select a date and time slot before proceeding with payment.'
                          );
                          return;
                        }
                        setShowPaymentSheet(true);
                      }}
                      variant="solid"
                      disabled={isSinglePayment && !selectedDate}
                      isLoading={isProcessingPayment}
                    />
                  </View>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
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
        amount={amountToPay}
        walletBalance={walletBalance}
      />
    </Modal>
  );
}

