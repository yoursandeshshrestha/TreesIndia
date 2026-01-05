import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { razorpayService } from '../../utils/razorpay';
import { Service } from '../../services/api/service.service';
import { Address } from '../../services/api/address.service';
import { bookingService, walletService } from '../../services';
import { useAppSelector } from '../../store/hooks';
import { TimeSlot, ContactInfoData } from '../../types/booking';
import BackIcon from '../../components/icons/BackIcon';
import Button from '../../components/ui/Button';
import AddressSelectionBottomSheet from './components/AddressSelectionBottomSheet';
import SlotSelectionBottomSheet from './components/SlotSelectionBottomSheet';
import ContactInfoBottomSheet from './components/ContactInfoBottomSheet';
import PaymentMethodBottomSheet from './components/PaymentMethodBottomSheet';
import BookingSuccessBottomSheet from './components/BookingSuccessBottomSheet';
import { bookingLogger } from '../../utils/logger';

interface BookingFlowScreenProps {
  service: Service;
  onBack: () => void;
  onComplete: () => void;
}

type Step = 'address' | 'slot' | 'contact' | 'payment' | 'review';

export default function BookingFlowScreen({
  service,
  onBack,
  onComplete,
}: BookingFlowScreenProps) {
  const user = useAppSelector((state) => state.auth.user);
  const isInquiryService = service.price_type === 'inquiry';

  // Steps configuration
  const steps: { id: Step; title: string }[] = isInquiryService
    ? [
        { id: 'address', title: 'Address' },
        { id: 'contact', title: 'Contact Info' },
        { id: 'review', title: 'Review' },
      ]
    : [
        { id: 'address', title: 'Address' },
        { id: 'slot', title: 'Date & Time' },
        { id: 'review', title: 'Review' },
      ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];

  // Booking data
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfoData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'wallet' | null>(null);

  // UI state
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showSlotSheet, setShowSlotSheet] = useState(false);
  const [showContactSheet, setShowContactSheet] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [bookingId, setBookingId] = useState<number | null>(null);

  // Use ref to track if component is mounted (prevent state updates on unmounted component)
  const isMountedRef = useRef(true);
  const isProcessingPaymentRef = useRef(false);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any pending auto-advance timeout
  const clearAutoAdvanceTimeout = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
      bookingLogger.debug('Cleared auto-advance timeout');
    }
  }, []);

  useEffect(() => {
    // Reset refs on mount to ensure clean state
    isMountedRef.current = true;
    isProcessingPaymentRef.current = false;

    bookingLogger.info('BookingFlowScreen mounted', {
      service_id: service.id || service.ID,
      service_name: service.name,
      is_inquiry: isInquiryService,
    });

    fetchWalletBalance();

    // Cleanup on unmount
    return () => {
      bookingLogger.info('BookingFlowScreen unmounting', {
        isProcessingPayment: isProcessingPaymentRef.current,
        hasAutoAdvanceTimeout: !!autoAdvanceTimeoutRef.current,
      });

      isMountedRef.current = false;

      // Clear any pending timeouts
      clearAutoAdvanceTimeout();

      // Reset processing flag
      if (isProcessingPaymentRef.current) {
        bookingLogger.warn('Component unmounting while payment is processing');
        isProcessingPaymentRef.current = false;
      }
    };
  }, [clearAutoAdvanceTimeout]);

  // Safe state setter that only updates if component is mounted
  const safeSetState = useCallback((setter: () => void) => {
    if (isMountedRef.current) {
      setter();
    } else {
      bookingLogger.warn('Attempted to set state on unmounted component');
    }
  }, []);

  // Track step changes
  useEffect(() => {
    bookingLogger.debug('Step changed', {
      step_index: currentStepIndex,
      step_id: currentStep.id,
      step_title: currentStep.title,
      has_address: !!selectedAddress,
      has_slot: !!selectedSlot,
      has_contact: !!contactInfo,
    });
  }, [currentStepIndex, currentStep.id, currentStep.title, selectedAddress, selectedSlot, contactInfo]);

  const fetchWalletBalance = async () => {
    bookingLogger.debug('Fetching wallet balance');
    try {
      const summary = await walletService.getWalletSummary();
      safeSetState(() => setWalletBalance(summary.current_balance));
      bookingLogger.debug('Wallet balance fetched', { balance: summary.current_balance });
    } catch (error) {
      bookingLogger.error('Failed to fetch wallet balance', error);
      safeSetState(() => setWalletBalance(0));
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep.id) {
      case 'address':
        return selectedAddress !== null;
      case 'slot':
        return selectedDate !== null && selectedSlot !== null;
      case 'contact':
        return contactInfo !== null;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    bookingLogger.debug('Navigating to next step', {
      current_step: currentStep.id,
      current_index: currentStepIndex,
      total_steps: steps.length,
    });

    if (!validateCurrentStep()) {
      bookingLogger.warn('Step validation failed', { step: currentStep.id });
      Alert.alert('Incomplete', 'Please complete this step to continue');
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      safeSetState(() => setCurrentStepIndex(currentStepIndex + 1));
      bookingLogger.info('Advanced to next step', { next_step: steps[currentStepIndex + 1].id });
    } else {
      // On final step, open payment sheet
      bookingLogger.info('Opening payment sheet');
      safeSetState(() => setShowPaymentSheet(true));
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
      onBack();
    }
  };

  const handleSelectAddress = (address: Address) => {
    bookingLogger.info('Address selected', {
      address_id: address.id,
      city: address.city,
      state: address.state,
    });

    safeSetState(() => setSelectedAddress(address));

    if (currentStep.id === 'address' && currentStepIndex === 0) {
      // Auto-advance to next step after selecting address
      bookingLogger.debug('Auto-advancing after address selection');
      clearAutoAdvanceTimeout();
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        if (currentStepIndex < steps.length - 1 && isMountedRef.current) {
          safeSetState(() => setCurrentStepIndex(currentStepIndex + 1));
          autoAdvanceTimeoutRef.current = null;
        }
      }, 300);
    }
  };

  const handleSelectSlot = (date: string, slot: TimeSlot) => {
    bookingLogger.info('Time slot selected', {
      date,
      slot_id: slot.id,
      start_time: slot.start_time,
      end_time: slot.end_time,
    });

    safeSetState(() => {
      setSelectedDate(date);
      setSelectedSlot(slot);
    });

    if (currentStep.id === 'slot') {
      // Auto-advance to next step after selecting slot
      bookingLogger.debug('Auto-advancing after slot selection');
      clearAutoAdvanceTimeout();
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        if (currentStepIndex < steps.length - 1 && isMountedRef.current) {
          safeSetState(() => setCurrentStepIndex(currentStepIndex + 1));
          autoAdvanceTimeoutRef.current = null;
        }
      }, 300);
    }
  };

  const handleSaveContactInfo = (data: ContactInfoData) => {
    bookingLogger.info('Contact info saved', {
      has_contact_person: !!data.contactPerson,
      has_phone: !!data.phone,
      has_description: !!data.description,
    });

    safeSetState(() => setContactInfo(data));

    if (currentStep.id === 'contact') {
      // Auto-advance to next step after saving contact info
      bookingLogger.debug('Auto-advancing after contact info saved');
      clearAutoAdvanceTimeout();
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        if (currentStepIndex < steps.length - 1 && isMountedRef.current) {
          safeSetState(() => setCurrentStepIndex(currentStepIndex + 1));
          autoAdvanceTimeoutRef.current = null;
        }
      }, 300);
    }
  };

  const handlePayment = async (method: 'razorpay' | 'wallet') => {
    // Prevent duplicate submissions
    if (isSubmitting || isProcessingPaymentRef.current) {
      bookingLogger.warn('Payment already in progress, ignoring duplicate request', {
        isSubmitting,
        isProcessingPayment: isProcessingPaymentRef.current,
      });
      return;
    }

    if (!selectedAddress) {
      Alert.alert('Error', 'Please select an address');
      return;
    }

    bookingLogger.info('Payment initiated', {
      method,
      is_inquiry: isInquiryService,
      has_address: !!selectedAddress,
      has_contact: !!contactInfo,
    });

    if (isInquiryService) {
      await handleInquiryBooking(method);
    } else {
      await handleFixedPriceBooking(method);
    }
  };

  const handleFixedPriceBooking = async (method: 'razorpay' | 'wallet') => {
    bookingLogger.flow('Fixed price booking', 'start', {
      method,
      service_id: service.id || service.ID,
      has_date: !!selectedDate,
      has_slot: !!selectedSlot,
      has_address: !!selectedAddress,
    });

    if (!selectedDate || !selectedSlot || !selectedAddress) {
      bookingLogger.warn('Missing required booking details');
      Alert.alert('Error', 'Please complete all booking details');
      return;
    }

    if (isProcessingPaymentRef.current) {
      bookingLogger.warn('Payment already in progress');
      return;
    }

    safeSetState(() => setIsSubmitting(true));
    isProcessingPaymentRef.current = true;

    try {
      const bookingData = {
        service_id: service.id || service.ID || 0,
        address: {
          name: selectedAddress.name,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          country: selectedAddress.country,
          postal_code: selectedAddress.postal_code,
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude,
          landmark: selectedAddress.landmark || '',
          house_number: selectedAddress.house_number || '',
        },
        scheduled_date: selectedDate,
        scheduled_time: selectedSlot.start_time,
      };

      if (method === 'wallet') {
        // Wallet payment - direct completion
        bookingLogger.flow('Wallet payment for booking', 'start');
        const response = await bookingService.createBookingWithWallet(bookingData);

        if (!isMountedRef.current) {
          bookingLogger.warn('Component unmounted after wallet booking created');
          return;
        }

        bookingLogger.flow('Wallet payment for booking', 'success', {
          booking_id: response.booking.ID || response.booking.id,
        });

        safeSetState(() => {
          setBookingId(response.booking.ID || response.booking.id || null);
          setShowPaymentSheet(false);
          setShowSuccessSheet(true);
          setIsSubmitting(false);
        });
        isProcessingPaymentRef.current = false;

        await fetchWalletBalance(); // Refresh balance
      } else {
        // Razorpay payment
        bookingLogger.flow('Razorpay payment for booking', 'start');
        const response = await bookingService.createBooking(bookingData);
        const paymentOrder = response.payment_order;

        if (!paymentOrder) {
          bookingLogger.error('Payment order not received from API');
          throw new Error('Payment order not received');
        }

        if (!isMountedRef.current) {
          bookingLogger.warn('Component unmounted after booking created');
          return;
        }

        // For Razorpay bookings, booking might be null until payment is verified
        const bookingIdFromResponse = response.booking ? (response.booking.ID || response.booking.id) : null;
        if (bookingIdFromResponse) {
          safeSetState(() => setBookingId(bookingIdFromResponse));
        }

        bookingLogger.info('Opening Razorpay checkout', {
          booking_id: bookingIdFromResponse,
          order_id: paymentOrder.id,
          amount: paymentOrder.amount,
        });

        // Open Razorpay checkout using the service wrapper
        const options = {
          key: paymentOrder.key_id,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          order_id: paymentOrder.id,
          name: 'Trees India',
          description: `Booking for ${service.name}`,
          prefill: {
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: { color: '#055c3a' },
        };

        await razorpayService.openCheckout(
          options,
          async (data) => {
            bookingLogger.flow('Razorpay payment verification', 'start', {
              booking_id: response.booking.ID || response.booking.id,
            });

            // Check if component is still mounted
            if (!isMountedRef.current) {
              bookingLogger.warn('Component unmounted during payment success callback');
              return;
            }

            // Verify payment
            try {
              const verificationResult = await bookingService.verifyBookingPayment(
                bookingIdFromResponse || 0,
                {
                  razorpay_order_id: data.razorpay_order_id,
                  razorpay_payment_id: data.razorpay_payment_id,
                  razorpay_signature: data.razorpay_signature,
                }
              );

              bookingLogger.flow('Razorpay payment verification', 'success');

              // Extract booking ID from verification response
              const verifiedBookingId = verificationResult.data?.booking?.ID || verificationResult.data?.booking?.id || bookingIdFromResponse;

              safeSetState(() => {
                if (verifiedBookingId) {
                  setBookingId(verifiedBookingId);
                }
                setShowPaymentSheet(false);
                setShowSuccessSheet(true);
                setIsSubmitting(false);
              });
              isProcessingPaymentRef.current = false;
            } catch (error) {
              bookingLogger.flow('Razorpay payment verification', 'error', {
                error: error instanceof Error ? error.message : 'Unknown error',
              });

              Alert.alert('Error', 'Payment verification failed. Please contact support.');
              safeSetState(() => setIsSubmitting(false));
              isProcessingPaymentRef.current = false;
            }
          },
          (error) => {
            bookingLogger.error('Razorpay payment error', error, {
              code: error.code,
              description: error.description,
            });

            // Check if component is still mounted
            if (!isMountedRef.current) {
              bookingLogger.warn('Component unmounted during payment error callback');
              return;
            }

            if (error.code !== 'PAYMENT_CANCELLED' && error.code !== '2' && error.code !== 'CHECKOUT_TIMEOUT') {
              // Code 2 is user cancellation
              Alert.alert('Payment Failed', error.description || 'Please try again');
            } else if (error.code === 'CHECKOUT_TIMEOUT') {
              Alert.alert(
                'Payment Timeout',
                'The payment process took too long. Please check your bookings and try again if needed.'
              );
            }

            safeSetState(() => setIsSubmitting(false));
            isProcessingPaymentRef.current = false;
          }
        );
      }
    } catch (error) {
      bookingLogger.flow('Fixed price booking', 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create booking'
      );

      safeSetState(() => setIsSubmitting(false));
      isProcessingPaymentRef.current = false;
    }
  };

  const handleInquiryBooking = async (method: 'razorpay' | 'wallet') => {
    bookingLogger.flow('Inquiry booking', 'start', {
      method,
      service_id: service.id || service.ID,
      has_address: !!selectedAddress,
      has_contact: !!contactInfo,
    });

    if (!selectedAddress || !contactInfo) {
      bookingLogger.warn('Missing required inquiry details');
      Alert.alert('Error', 'Please complete all booking details');
      return;
    }

    if (isProcessingPaymentRef.current) {
      bookingLogger.warn('Payment already in progress');
      return;
    }

    safeSetState(() => setIsSubmitting(true));
    isProcessingPaymentRef.current = true;

    try {
      const inquiryData = {
        service_id: service.id || service.ID || 0,
        address: {
          name: selectedAddress.name,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          country: selectedAddress.country,
          postal_code: selectedAddress.postal_code,
          latitude: selectedAddress.latitude,
          longitude: selectedAddress.longitude,
          landmark: selectedAddress.landmark || '',
          house_number: selectedAddress.house_number || '',
        },
        contact_person: contactInfo.contactPerson,
        contact_phone: contactInfo.phone,
        description: contactInfo.description,
        special_instructions: contactInfo.specialInstructions || '',
      };

      if (method === 'wallet') {
        // Wallet payment - direct completion
        bookingLogger.flow('Wallet payment for inquiry', 'start');
        const response = await bookingService.createInquiryWithWallet(inquiryData);

        if (!isMountedRef.current) {
          bookingLogger.warn('Component unmounted after wallet inquiry created');
          return;
        }

        bookingLogger.flow('Wallet payment for inquiry', 'success', {
          booking_id: response.booking.ID || response.booking.id,
        });

        safeSetState(() => {
          setBookingId(response.booking.ID || response.booking.id || null);
          setShowPaymentSheet(false);
          setShowSuccessSheet(true);
          setIsSubmitting(false);
        });
        isProcessingPaymentRef.current = false;

        await fetchWalletBalance(); // Refresh balance
      } else {
        // Razorpay payment
        bookingLogger.flow('Razorpay payment for inquiry', 'start');
        const response = await bookingService.createInquiry(inquiryData);
        const paymentOrder = response.payment_order;

        if (!paymentOrder) {
          bookingLogger.error('Payment order not received for inquiry');
          throw new Error('Payment order not received');
        }

        if (!isMountedRef.current) {
          bookingLogger.warn('Component unmounted after inquiry created');
          return;
        }

        // For Razorpay inquiries, booking might be null until payment is verified
        const bookingIdFromResponse = response.booking ? (response.booking.ID || response.booking.id) : null;
        if (bookingIdFromResponse) {
          safeSetState(() => setBookingId(bookingIdFromResponse));
        }

        bookingLogger.info('Opening Razorpay checkout for inquiry', {
          booking_id: bookingIdFromResponse,
          order_id: paymentOrder.id,
          amount: paymentOrder.amount,
        });

        // Open Razorpay checkout using the service wrapper
        const options = {
          key: paymentOrder.key_id,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          order_id: paymentOrder.id,
          name: 'Trees India',
          description: `Inquiry fee for ${service.name}`,
          prefill: {
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: { color: '#055c3a' },
        };

        await razorpayService.openCheckout(
          options,
          async (data) => {
            bookingLogger.flow('Inquiry payment verification', 'start', {
              service_id: service.id || service.ID,
            });

            // Check if component is still mounted
            if (!isMountedRef.current) {
              bookingLogger.warn('Component unmounted during inquiry payment success callback');
              return;
            }

            // Verify payment
            try {
              const verificationResult = await bookingService.verifyInquiryPayment(
                service.id || service.ID || 0,
                {
                  razorpay_order_id: data.razorpay_order_id,
                  razorpay_payment_id: data.razorpay_payment_id,
                  razorpay_signature: data.razorpay_signature,
                }
              );

              bookingLogger.flow('Inquiry payment verification', 'success');

              // Extract booking ID from verification response
              const verifiedBookingId = verificationResult.data?.booking?.ID || verificationResult.data?.booking?.id || bookingIdFromResponse;

              safeSetState(() => {
                if (verifiedBookingId) {
                  setBookingId(verifiedBookingId);
                }
                setShowPaymentSheet(false);
                setShowSuccessSheet(true);
                setIsSubmitting(false);
              });
              isProcessingPaymentRef.current = false;
            } catch (error) {
              bookingLogger.flow('Inquiry payment verification', 'error', {
                error: error instanceof Error ? error.message : 'Unknown error',
              });

              Alert.alert('Error', 'Payment verification failed. Please contact support.');
              safeSetState(() => setIsSubmitting(false));
              isProcessingPaymentRef.current = false;
            }
          },
          (error) => {
            bookingLogger.error('Inquiry Razorpay payment error', error, {
              code: error.code,
              description: error.description,
            });

            // Check if component is still mounted
            if (!isMountedRef.current) {
              bookingLogger.warn('Component unmounted during inquiry payment error callback');
              return;
            }

            if (error.code !== 'PAYMENT_CANCELLED' && error.code !== '2' && error.code !== 'CHECKOUT_TIMEOUT') {
              // Code 2 is user cancellation
              Alert.alert('Payment Failed', error.description || 'Please try again');
            } else if (error.code === 'CHECKOUT_TIMEOUT') {
              Alert.alert(
                'Payment Timeout',
                'The payment process took too long. Please check your bookings and try again if needed.'
              );
            }

            safeSetState(() => setIsSubmitting(false));
            isProcessingPaymentRef.current = false;
          }
        );
      }
    } catch (error) {
      bookingLogger.flow('Inquiry booking', 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create inquiry'
      );

      safeSetState(() => setIsSubmitting(false));
      isProcessingPaymentRef.current = false;
    }
  };

  const getAmount = (): number => {
    if (isInquiryService) {
      // Inquiry fee - you might want to fetch this from config
      return 100; // Default inquiry fee
    }
    return service.price || 0;
  };

  const handleViewBookings = () => {
    setShowSuccessSheet(false);
    onComplete();
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-[#E5E7EB]">
        <TouchableOpacity onPress={handleBack} className="mr-3">
          <BackIcon size={24} color="#111928" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-semibold text-[#111928]" style={{ fontFamily: 'Inter-SemiBold' }}>
            Book Service
          </Text>
          <Text className="text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            {service.name}
          </Text>
        </View>
      </View>

      {/* Progress Indicator */}
      <View className="px-6 py-4 border-b border-[#E5E7EB]">
        <View className="flex-row items-center mb-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <View
                className={`flex-1 h-1 rounded ${
                  index <= currentStepIndex ? 'bg-[#055c3a]' : 'bg-[#E5E7EB]'
                }`}
              />
              {index < steps.length - 1 && <View className="w-2" />}
            </React.Fragment>
          ))}
        </View>
        <Text className="text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
          Step {currentStepIndex + 1} of {steps.length}: {currentStep.title}
        </Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6 py-4">
        {/* Address Step */}
        {currentStep.id === 'address' && (
          <View>
            <Text className="text-lg font-semibold text-[#111928] mb-4" style={{ fontFamily: 'Inter-SemiBold' }}>
              Select Service Address
            </Text>
            {selectedAddress ? (
              <TouchableOpacity
                className="p-4 bg-[#F0FDF4] border border-[#055c3a] rounded-xl mb-4"
                onPress={() => setShowAddressSheet(true)}
              >
                <Text className="text-sm text-[#055c3a] font-semibold mb-2" style={{ fontFamily: 'Inter-SemiBold' }}>
                  {selectedAddress.name}
                </Text>
                <Text className="text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                  {selectedAddress.house_number ? `${selectedAddress.house_number}, ` : ''}
                  {selectedAddress.address}
                </Text>
                <Text className="text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                  {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
                </Text>
                <Text className="text-sm text-[#055c3a] mt-2" style={{ fontFamily: 'Inter-Medium' }}>
                  Tap to change
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="p-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl items-center"
                onPress={() => setShowAddressSheet(true)}
              >
                <Text className="text-[#055c3a] font-semibold" style={{ fontFamily: 'Inter-SemiBold' }}>
                  + Select Address
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Slot Step (Fixed-price only) */}
        {currentStep.id === 'slot' && (
          <View>
            <Text className="text-lg font-semibold text-[#111928] mb-4" style={{ fontFamily: 'Inter-SemiBold' }}>
              Select Date & Time
            </Text>
            {selectedDate && selectedSlot ? (
              <TouchableOpacity
                className="p-4 bg-[#F0FDF4] border border-[#055c3a] rounded-xl mb-4"
                onPress={() => setShowSlotSheet(true)}
              >
                <Text className="text-sm text-[#055c3a] font-semibold mb-2" style={{ fontFamily: 'Inter-SemiBold' }}>
                  {formatDate(selectedDate)}
                </Text>
                <Text className="text-base text-[#111928] font-semibold" style={{ fontFamily: 'Inter-SemiBold' }}>
                  {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                </Text>
                <Text className="text-sm text-[#055c3a] mt-2" style={{ fontFamily: 'Inter-Medium' }}>
                  Tap to change
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="p-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl items-center"
                onPress={() => setShowSlotSheet(true)}
              >
                <Text className="text-[#055c3a] font-semibold" style={{ fontFamily: 'Inter-SemiBold' }}>
                  + Select Date & Time
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Contact Step (Inquiry only) */}
        {currentStep.id === 'contact' && (
          <View>
            <Text className="text-lg font-semibold text-[#111928] mb-4" style={{ fontFamily: 'Inter-SemiBold' }}>
              Contact Information
            </Text>
            {contactInfo ? (
              <TouchableOpacity
                className="p-4 bg-[#F0FDF4] border border-[#055c3a] rounded-xl mb-4"
                onPress={() => setShowContactSheet(true)}
              >
                <Text className="text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                  Contact Person
                </Text>
                <Text className="text-base text-[#111928] font-semibold" style={{ fontFamily: 'Inter-SemiBold' }}>
                  {contactInfo.contactPerson}
                </Text>
                <Text className="text-sm text-[#6B7280] mt-2" style={{ fontFamily: 'Inter-Regular' }}>
                  Phone
                </Text>
                <Text className="text-base text-[#111928] font-semibold" style={{ fontFamily: 'Inter-SemiBold' }}>
                  {contactInfo.phone}
                </Text>
                <Text className="text-sm text-[#6B7280] mt-2" style={{ fontFamily: 'Inter-Regular' }}>
                  Description
                </Text>
                <Text className="text-base text-[#111928]" style={{ fontFamily: 'Inter-Regular' }}>
                  {contactInfo.description}
                </Text>
                {contactInfo.specialInstructions && (
                  <>
                    <Text className="text-sm text-[#6B7280] mt-2" style={{ fontFamily: 'Inter-Regular' }}>
                      Special Instructions
                    </Text>
                    <Text className="text-base text-[#111928]" style={{ fontFamily: 'Inter-Regular' }}>
                      {contactInfo.specialInstructions}
                    </Text>
                  </>
                )}
                <Text className="text-sm text-[#055c3a] mt-2" style={{ fontFamily: 'Inter-Medium' }}>
                  Tap to change
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="p-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl items-center"
                onPress={() => setShowContactSheet(true)}
              >
                <Text className="text-[#055c3a] font-semibold" style={{ fontFamily: 'Inter-SemiBold' }}>
                  + Add Contact Info
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Review Step */}
        {currentStep.id === 'review' && (
          <View>
            <Text className="text-lg font-semibold text-[#111928] mb-4" style={{ fontFamily: 'Inter-SemiBold' }}>
              Review Booking
            </Text>

            {/* Service Details */}
            <View className="mb-4 p-4 bg-[#F9FAFB] rounded-xl">
              <Text className="text-sm text-[#6B7280] mb-2" style={{ fontFamily: 'Inter-Regular' }}>
                Service
              </Text>
              <Text className="text-base text-[#111928] font-semibold" style={{ fontFamily: 'Inter-SemiBold' }}>
                {service.name}
              </Text>
              <Text className="text-sm text-[#6B7280] mt-2" style={{ fontFamily: 'Inter-Regular' }}>
                {service.description}
              </Text>
            </View>

            {/* Address */}
            {selectedAddress && (
              <View className="mb-4 p-4 bg-[#F9FAFB] rounded-xl">
                <Text className="text-sm text-[#6B7280] mb-2" style={{ fontFamily: 'Inter-Regular' }}>
                  Service Address
                </Text>
                <Text className="text-base text-[#111928] font-semibold" style={{ fontFamily: 'Inter-SemiBold' }}>
                  {selectedAddress.name}
                </Text>
                <Text className="text-sm text-[#6B7280] mt-1" style={{ fontFamily: 'Inter-Regular' }}>
                  {selectedAddress.house_number ? `${selectedAddress.house_number}, ` : ''}
                  {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
                </Text>
              </View>
            )}

            {/* Date & Time (Fixed-price only) */}
            {!isInquiryService && selectedDate && selectedSlot && (
              <View className="mb-4 p-4 bg-[#F9FAFB] rounded-xl">
                <Text className="text-sm text-[#6B7280] mb-2" style={{ fontFamily: 'Inter-Regular' }}>
                  Scheduled Date & Time
                </Text>
                <Text className="text-base text-[#111928] font-semibold" style={{ fontFamily: 'Inter-SemiBold' }}>
                  {formatDate(selectedDate)}
                </Text>
                <Text className="text-sm text-[#6B7280] mt-1" style={{ fontFamily: 'Inter-Regular' }}>
                  {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                </Text>
              </View>
            )}

            {/* Contact Info (Inquiry only) */}
            {isInquiryService && contactInfo && (
              <View className="mb-4 p-4 bg-[#F9FAFB] rounded-xl">
                <Text className="text-sm text-[#6B7280] mb-2" style={{ fontFamily: 'Inter-Regular' }}>
                  Contact Information
                </Text>
                <Text className="text-base text-[#111928] font-semibold" style={{ fontFamily: 'Inter-SemiBold' }}>
                  {contactInfo.contactPerson} - {contactInfo.phone}
                </Text>
                <Text className="text-sm text-[#6B7280] mt-2" style={{ fontFamily: 'Inter-Regular' }}>
                  {contactInfo.description}
                </Text>
              </View>
            )}

            {/* Price */}
            <View className="mb-4 p-4 bg-[#F0FDF4] border border-[#055c3a] rounded-xl">
              <Text className="text-sm text-[#6B7280] mb-2" style={{ fontFamily: 'Inter-Regular' }}>
                {isInquiryService ? 'Inquiry Fee' : 'Total Amount'}
              </Text>
              <Text className="text-2xl text-[#055c3a] font-bold" style={{ fontFamily: 'Inter-Bold' }}>
                ₹{getAmount().toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="px-6 pb-6 pt-4 border-t border-[#E5E7EB]">
        <Button
          label={currentStepIndex === steps.length - 1 ? 'Proceed to Payment' : 'Next'}
          onPress={handleNext}
          disabled={!validateCurrentStep() || isSubmitting}
          isLoading={isSubmitting}
        />
      </View>

      {/* Bottom Sheets */}
      <AddressSelectionBottomSheet
        visible={showAddressSheet}
        onClose={() => setShowAddressSheet(false)}
        onSelectAddress={handleSelectAddress}
        selectedAddressId={selectedAddress?.id}
        service={service}
      />

      {!isInquiryService && service.duration && (
        <SlotSelectionBottomSheet
          visible={showSlotSheet}
          onClose={() => setShowSlotSheet(false)}
          onSelectSlot={handleSelectSlot}
          serviceId={service.id || service.ID || 0}
          duration={service.duration}
          selectedDate={selectedDate || undefined}
          selectedSlotId={selectedSlot?.id}
        />
      )}

      {isInquiryService && (
        <ContactInfoBottomSheet
          visible={showContactSheet}
          onClose={() => setShowContactSheet(false)}
          onSave={handleSaveContactInfo}
          initialData={contactInfo || {
            contactPerson: user?.name || '',
            phone: user?.phone || '',
            description: '',
            specialInstructions: '',
          }}
        />
      )}

      <PaymentMethodBottomSheet
        visible={showPaymentSheet}
        onClose={() => {
          if (!isSubmitting) {
            setShowPaymentSheet(false);
          }
        }}
        onSelectMethod={handlePayment}
        selectedMethod={paymentMethod || undefined}
        amount={getAmount()}
        walletBalance={walletBalance}
      />

      <BookingSuccessBottomSheet
        visible={showSuccessSheet}
        bookingId={bookingId}
        bookingType={isInquiryService ? 'inquiry' : 'fixed'}
        onViewBookings={handleViewBookings}
      />

      {/* Processing Overlay */}
      {isSubmitting && (
        <View className="absolute inset-0 bg-black/60 items-center justify-center">
          <View className="bg-white p-8 rounded-2xl items-center">
            <ActivityIndicator size="large" color="#055c3a" />
            <Text className="text-[#111928] mt-4 text-lg font-semibold" style={{ fontFamily: 'Inter-SemiBold' }}>
              Processing
            </Text>
            <Text className="text-[#6B7280] mt-2 text-center" style={{ fontFamily: 'Inter-Regular' }}>
              Please wait...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
