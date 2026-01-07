import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMyBookings } from '../../store/slices/bookingSlice';
import { Booking } from '../../types/booking';
import BookingIcon from '../../components/icons/BookingIcon';
import CalendarIcon from '../../components/icons/CalendarIcon';
import BookingDetailBottomSheet from './components/BookingDetailBottomSheet';
import Button from '../../components/ui/Button';
import { bookingService } from '../../services';
import QuoteAcceptanceBottomSheet from './components/QuoteAcceptanceBottomSheet';

type TabType = 'ongoing' | 'completed';

interface BookingScreenProps {
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

export default function BookingScreen(props: BookingScreenProps) {
  const { onNavigateToChat } = props;
  const dispatch = useAppDispatch();
  const { bookings, isLoading, pagination } = useAppSelector((state) => state.booking);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('ongoing');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showQuoteAcceptanceSheet, setShowQuoteAcceptanceSheet] = useState(false);
  const [bookingForQuote, setBookingForQuote] = useState<Booking | null>(null);
  const [isAcceptingQuote, setIsAcceptingQuote] = useState(false);
  const [isRejectingQuote, setIsRejectingQuote] = useState(false);

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'ongoing') {
      return ['pending', 'confirmed', 'in_progress', 'assigned', 'quote_provided', 'quote_accepted', 'partially_paid'].includes(booking.status);
    } else {
      return ['completed', 'cancelled'].includes(booking.status);
    }
  });

  const loadBookings = useCallback(async () => {
    setError(null);
    try {
      await dispatch(fetchMyBookings({ page: 1, limit: 20 })).unwrap();
    } catch (error) {
      console.error('[BookingScreen] Failed to load bookings:', error);
      setError('Failed to load bookings. Please try again.');
    }
  }, [dispatch]);

  useEffect(() => {
    loadBookings();
  }, [isAuthenticated, user, loadBookings]);


  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
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

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (time?: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatBookingId = (booking: Booking): string => {
    const createdAt = booking.created_at ? new Date(booking.created_at) : new Date();

    const year = createdAt.getFullYear();
    const month = String(createdAt.getMonth() + 1).padStart(2, '0');
    const day = String(createdAt.getDate()).padStart(2, '0');
    const hours = String(createdAt.getHours()).padStart(2, '0');
    const minutes = String(createdAt.getMinutes()).padStart(2, '0');
    const seconds = String(createdAt.getSeconds()).padStart(2, '0');

    return `BK${year}${month}${day}${hours}${minutes}${seconds}`;
  };

  const renderBookingCard = (booking: Booking, index: number, total: number) => {
    if (!booking) {
      return null;
    }

    const bookingData = booking as any;

    // Handle both id and ID fields (API inconsistency)
    const bookingId = booking.id || booking.ID || (booking as any).ID || `booking-${index}`;
    const statusColor = getStatusColor(booking.status);
    const statusLabel = getStatusLabel(booking.status);
    // Check booking_type from API (can be "inquiry" or "regular") or fallback to is_inquiry
    const isInquiry = (booking as any).booking_type === 'inquiry' || booking.is_inquiry === true;

    // Format date for display - handle both booking_date and scheduled_date
    const displayDate = booking.booking_date || (booking as any).scheduled_date;
    const displayTime = booking.start_time || (booking as any).scheduled_time;
    
    // Handle contact info - can be in contact object or direct fields
    const contactInfo = (booking as any).contact || {};
    const contactPerson = booking.contact_person || contactInfo.contact_person;
    const contactPhone = booking.contact_phone || contactInfo.contact_phone;
    const description = booking.description || contactInfo.description;
    
    // Handle payment info - can be in payment object or direct fields
    const paymentInfo = (booking as any).payment || {};
    const totalAmount = booking.total_amount || paymentInfo.amount;
    const paymentStatus = booking.payment_status || paymentInfo.status;
    
    // Handle quote info for inquiry bookings
    const quoteAmount = (booking as any).quote_amount;
    const quoteProvidedAt = (booking as any).quote_provided_at;
    const hasQuote = quoteAmount != null && quoteAmount > 0;
    const paymentSegments = (booking as any).payment_segments || [];
    const paidSegments = paymentSegments.filter((seg: any) => seg.status === 'paid');
    const paidAmount = paidSegments.reduce((sum: number, seg: any) => sum + (seg.amount || 0), 0);
    
    // Check if payment is fully completed
    // Payment is complete if: 
    // 1. payment_status is 'completed' or 'paid' (check as string since backend may use 'completed')
    // 2. booking status is 'confirmed' or 'assigned' (indicates payment was completed)
    // 3. all segments are paid
    // 4. paidAmount >= quoteAmount
    const bookingStatus = (booking as any).status || booking.status;
    const paymentStatusStr = String(paymentStatus || '');
    const isPaymentCompleted = paymentStatusStr === 'completed' || 
                               paymentStatusStr === 'paid' ||
                               (bookingStatus === 'confirmed' || bookingStatus === 'assigned') ||
                               (paymentSegments.length > 0 && paymentSegments.every((seg: any) => seg.status === 'paid')) ||
                               (hasQuote && paidAmount >= quoteAmount);
    
    // Calculate remaining amount - if payment is completed, remaining should be 0
    const remainingAmount = (hasQuote && !isPaymentCompleted) ? Math.max(0, quoteAmount - paidAmount) : 0;
    
    // Handle worker assignment - check if it exists and is not null
    let workerName: string | undefined;
    let workerPhone: string | undefined;
    
    try {
      const workerAssignment = (booking as any).worker_assignment;

      if (workerAssignment && typeof workerAssignment === 'object' && workerAssignment !== null) {
        // Try different possible structures
        const worker = workerAssignment.worker || workerAssignment;

        if (worker && typeof worker === 'object' && worker !== null) {
          workerName = worker.name || worker.contact_info?.name || worker.contact_person_name || worker.Name;
          workerPhone = worker.phone || worker.contact_info?.phone || worker.contact_person_phone || worker.Phone;
        }
      }
    } catch (error) {
      // Continue rendering the card even if worker assignment extraction fails
    }

    // For quote_accepted bookings, open quote acceptance sheet (for payment/scheduling)
    // For quote_provided and partially_paid bookings, open detail sheet
    const bookingStatusForSheet = (booking as any).status;
    const isQuoteAccepted = bookingStatusForSheet === 'quote_accepted' && hasQuote;
    const shouldOpenQuoteSheet = isQuoteAccepted;

    return (
      <TouchableOpacity
        key={bookingId}
        onPress={() => {
          if (shouldOpenQuoteSheet) {
            // For quote bookings, open quote acceptance sheet directly
            setBookingForQuote(booking);
            setShowQuoteAcceptanceSheet(true);
          } else {
            // For other bookings, open detail sheet
            setSelectedBooking(booking);
            setShowDetailSheet(true);
          }
        }}
        activeOpacity={0.7}
      >
        <View className="px-6 py-4">
          {/* Header: Service Name and Status */}
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 mr-3">
              <Text
                className="text-base font-bold text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}
                numberOfLines={2}
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
          <View className="mb-3">
            <Text
              className="text-xs font-semibold text-[#6B7280] mb-1"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              BOOKING ID
            </Text>
            <Text
              className="text-sm text-[#111928]"
              style={{ fontFamily: 'Inter-Medium' }}
            >
              {formatBookingId(booking)}
            </Text>
          </View>

          {isInquiry ? (
            // Inquiry Booking Layout
            <>
              {/* Contact Info */}
              {contactPerson && (
                <View className="mb-3">
                  <Text
                    className="text-xs font-semibold text-[#6B7280] mb-1"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    CONTACT PERSON
                  </Text>
                  <Text
                    className="text-sm text-[#111928]"
                    style={{ fontFamily: 'Inter-Medium' }}
                  >
                    {contactPerson}
                    {contactPhone && ` • ${contactPhone}`}
                  </Text>
                </View>
              )}

              {/* Description */}
              {description && (
                <View className="mb-3">
                  <Text
                    className="text-xs font-semibold text-[#6B7280] mb-1"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    DESCRIPTION
                  </Text>
                  <Text
                    className="text-sm text-[#4B5563] leading-5"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
                    {description}
                  </Text>
                </View>
              )}

              {/* Quote Information */}
              {hasQuote ? (
                <View className="mb-3">
                  <Text
                    className="text-xs font-semibold text-[#6B7280] mb-1"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    QUOTE AMOUNT
                  </Text>
                  <View className="flex-row items-center justify-between mb-1">
                    <Text
                      className="text-xl font-bold text-[#00a871]"
                      style={{ fontFamily: 'Inter-Bold' }}
                    >
                      ₹{quoteAmount.toLocaleString('en-IN')}
                    </Text>
                    {paidAmount > 0 && (
                      <View className="px-2 py-0.5 rounded bg-[#D1FAE5]">
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
                    <View className="flex-row items-center gap-2 mb-2">
                      <Text
                        className="text-xs text-[#6B7280]"
                        style={{ fontFamily: 'Inter-Regular' }}
                      >
                        Remaining: ₹{remainingAmount.toLocaleString('en-IN')}
                      </Text>
                      {bookingStatusForSheet === 'partially_paid' && (
                        <View className="px-2 py-0.5 rounded bg-[#FEF3C7]">
                          <Text
                            className="text-xs font-semibold"
                            style={{ fontFamily: 'Inter-SemiBold', color: '#92400E' }}
                          >
                            Tap to Pay
                          </Text>
                        </View>
                      )}
                    </View>
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
              ) : (
                <View className="bg-[#F9FAFB] border-y border-[#E5E7EB] -mx-6 px-6 py-3 mt-1">
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
            // Fixed Price Booking Layout
            <>
              {/* Service Date */}
              <View className="mb-3">
                <Text
                  className="text-xs font-semibold text-[#6B7280] mb-1"
                  style={{ fontFamily: 'Inter-SemiBold' }}
                >
                  SERVICE DATE
                </Text>
                {displayDate ? (
                  <View className="flex-row items-center">
                    <CalendarIcon size={14} color="#111928" />
                    <Text
                      className="text-sm text-[#111928] ml-2"
                      style={{ fontFamily: 'Inter-Medium' }}
                      numberOfLines={1}
                    >
                      {formatDate(displayDate)}
                      {displayTime && ` • ${formatTime(displayTime)}`}
                    </Text>
                  </View>
                ) : (
                  <Text
                    className="text-sm text-[#6B7280]"
                    style={{ fontFamily: 'Inter-Regular' }}
                  >
                    To be scheduled after quote acceptance
                  </Text>
                )}
              </View>

              {/* Worker Assignment */}
              {workerName && (
                <View className="mb-3">
                  <Text
                    className="text-xs font-semibold text-[#6B7280] mb-1"
                    style={{ fontFamily: 'Inter-SemiBold' }}
                  >
                    WORKER ASSIGNED
                  </Text>
                  <Text
                    className="text-sm text-[#111928]"
                    style={{ fontFamily: 'Inter-Medium' }}
                  >
                    {workerName}
                    {workerPhone && ` • ${workerPhone}`}
                  </Text>
                </View>
              )}

              {/* Amount & Payment Status */}
              <View className="mt-1">
                {totalAmount != null && totalAmount > 0 ? (
                  <View>
                    <Text
                      className="text-xs font-semibold text-[#6B7280] mb-1"
                      style={{ fontFamily: 'Inter-SemiBold' }}
                    >
                      TOTAL AMOUNT
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text
                        className="text-xl font-bold text-[#00a871]"
                        style={{ fontFamily: 'Inter-Bold' }}
                        numberOfLines={1}
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
                ) : (
                  <View className="bg-[#F9FAFB] border-y border-[#E5E7EB] -mx-6 px-6 py-3">
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
              </View>
            </>
          )}

          {/* Accept/Reject/View Quote Buttons - Only for quote_provided status */}
          {isInquiry && ((booking as any).status === 'quote_provided') && hasQuote && (
            <View className="mt-4 pt-4 pb-4 border-t border-[#E5E7EB]">
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <TouchableOpacity
                    onPress={async () => {
                      const bookingId = booking.id || booking.ID;
                      if (!bookingId) return;
                      
                      // Close detail sheet first if open
                      if (showDetailSheet && selectedBooking?.id === booking.id) {
                        setShowDetailSheet(false);
                        setSelectedBooking(null);
                        // Wait a bit for animation to complete
                        await new Promise(resolve => setTimeout(resolve, 300));
                      }
                      
                      setIsAcceptingQuote(true);
                      try {
                        await bookingService.acceptQuote(bookingId, 'Quote accepted via mobile app');
                        // Refresh bookings to get updated status
                        await dispatch(fetchMyBookings({ page: 1, limit: 20 }));
                        // Use current booking with updated status (will be refreshed from API)
                        const updatedBooking = { ...booking, status: 'quote_accepted' as const };
                        // Open quote acceptance bottom sheet
                        setBookingForQuote(updatedBooking);
                        setShowQuoteAcceptanceSheet(true);
                      } catch (error: any) {
                        console.error('Error accepting quote:', error);
                        Alert.alert(
                          'Error',
                          error?.message || 'Failed to accept quote. Please try again.'
                        );
                      } finally {
                        setIsAcceptingQuote(false);
                      }
                    }}
                    disabled={isAcceptingQuote}
                    className="flex-1 bg-[#055c3a] rounded-lg py-2.5 items-center justify-center"
                    activeOpacity={0.8}
                  >
                    {isAcceptingQuote ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text
                        className="text-white text-sm font-semibold"
                        style={{ fontFamily: 'Inter-SemiBold' }}
                      >
                        Accept
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                <View className="flex-1">
                  <TouchableOpacity
                    onPress={async () => {
                      Alert.alert(
                        'Reject Quote',
                        'Are you sure you want to reject this quote?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Reject',
                            style: 'destructive',
                            onPress: async () => {
                              const bookingId = booking.id || booking.ID;
                              if (!bookingId) return;
                              
                              setIsRejectingQuote(true);
                              try {
                                await bookingService.rejectQuote(bookingId, 'Rejected by customer');
                                // Refresh bookings
                                await dispatch(fetchMyBookings({ page: 1, limit: 20 }));
                                Alert.alert('Success', 'Quote rejected successfully');
                              } catch (error: any) {
                                console.error('Error rejecting quote:', error);
                                Alert.alert(
                                  'Error',
                                  error?.message || 'Failed to reject quote. Please try again.'
                                );
                              } finally {
                                setIsRejectingQuote(false);
                              }
                            },
                          },
                        ]
                      );
                    }}
                    disabled={isRejectingQuote}
                    className="flex-1 border border-[#055c3a] bg-transparent rounded-lg py-2.5 items-center justify-center"
                    activeOpacity={0.8}
                  >
                    {isRejectingQuote ? (
                      <ActivityIndicator size="small" color="#055c3a" />
                    ) : (
                      <Text
                        className="text-[#055c3a] text-sm font-semibold"
                        style={{ fontFamily: 'Inter-SemiBold' }}
                      >
                        Reject
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          
          {/* Pay Button for quote_accepted status with remaining payment */}
          {isInquiry && ((booking as any).status === 'quote_accepted') && hasQuote && remainingAmount > 0 && (
            <View className="mt-4 pt-4 border-t border-[#E5E7EB]">
              <Button
                label={`Pay ₹${remainingAmount.toLocaleString('en-IN')}`}
                onPress={async () => {
                  // Close detail sheet first if open
                  if (showDetailSheet && selectedBooking?.id === booking.id) {
                    setShowDetailSheet(false);
                    setSelectedBooking(null);
                    // Wait a bit for animation to complete
                    await new Promise(resolve => setTimeout(resolve, 300));
                  }
                  // Open quote acceptance bottom sheet for payment
                  setBookingForQuote(booking);
                  setShowQuoteAcceptanceSheet(true);
                }}
                variant="solid"
              />
            </View>
          )}
        </View>
        <View className="h-px bg-[#E5E7EB] -mx-6" />
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (isLoading && bookings.length === 0) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#055c3a" />
        </View>
      );
    }

    if (error && bookings.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="text-4xl mb-4"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            ⚠️
          </Text>
          <Text
            className="text-base text-[#B3261E] mb-4 text-center"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={loadBookings}
            className="bg-[#055c3a] px-6 py-3 rounded-lg"
          >
            <Text
              className="text-white font-semibold"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredBookings.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <BookingIcon size={64} color="#9CA3AF" />
          <Text
            className="text-lg font-semibold text-[#4B5563] mb-2 mt-4 text-center"
            style={{ fontFamily: 'Inter-SemiBold' }}
          >
            No {activeTab} bookings
          </Text>
          <Text
            className="text-sm text-[#6B7280] text-center"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            {activeTab === 'ongoing'
              ? 'Book a service to see your bookings here'
              : 'Your completed bookings will appear here'}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#055c3a"
          />
        }
      >
        {filteredBookings.map((booking, index) =>
          renderBookingCard(booking, index, filteredBookings.length)
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-[#E5E7EB]">
        <Text
          className="text-xl font-semibold text-[#111928] flex-1"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          My Bookings
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-[#E5E7EB]">
        <TouchableOpacity
          onPress={() => setActiveTab('ongoing')}
          className="flex-1"
          activeOpacity={0.7}
        >
          <View
            className={`py-4 px-6 border-b-2 ${
              activeTab === 'ongoing'
                ? 'border-[#055c3a]'
                : 'border-transparent'
            }`}
          >
            <Text
              className="text-base font-medium text-center"
              style={{
                fontFamily: 'Inter-Medium',
                color: activeTab === 'ongoing' ? '#055c3a' : '#6B7280',
              }}
            >
              Ongoing
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          className="flex-1"
          activeOpacity={0.7}
        >
          <View
            className={`py-4 px-6 border-b-2 ${
              activeTab === 'completed'
                ? 'border-[#055c3a]'
                : 'border-transparent'
            }`}
          >
            <Text
              className="text-base font-medium text-center"
              style={{
                fontFamily: 'Inter-Medium',
                color: activeTab === 'completed' ? '#055c3a' : '#6B7280',
              }}
            >
              Completed
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderContent()}

      {/* Global loading overlay while bookings are refreshing (e.g. after payment) */}
      {isLoading && bookings.length > 0 && (
        <View className="absolute inset-0 bg-black/10 items-center justify-center">
          <ActivityIndicator size="large" color="#055c3a" />
        </View>
      )}

      {/* Booking Detail Bottom Sheet - Only show if quote acceptance sheet is not open */}
      {!showQuoteAcceptanceSheet && (
        <BookingDetailBottomSheet
          visible={showDetailSheet}
          onClose={() => {
            setShowDetailSheet(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onPaymentSuccess={async () => {
            // Refresh bookings after successful payment
            await dispatch(fetchMyBookings({ page: 1, limit: 20 }));
          }}
          onNavigateToChat={onNavigateToChat}
        />
      )}

      {/* Quote Acceptance Bottom Sheet */}
      <QuoteAcceptanceBottomSheet
        visible={showQuoteAcceptanceSheet}
        onClose={() => {
          setShowQuoteAcceptanceSheet(false);
          setBookingForQuote(null);
        }}
        booking={bookingForQuote}
        onSuccess={async () => {
          // Refresh bookings after successful quote acceptance and payment
          await dispatch(fetchMyBookings({ page: 1, limit: 20 }));
          setShowQuoteAcceptanceSheet(false);
          setBookingForQuote(null);
        }}
      />
    </SafeAreaView>
  );
}
