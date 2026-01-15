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
      return [
        'pending',
        'confirmed',
        'in_progress',
        'assigned',
        'quote_provided',
        'quote_accepted',
        'partially_paid',
      ].includes(booking.status);
    } else {
      return ['completed', 'cancelled'].includes(booking.status);
    }
  });

  const loadBookings = useCallback(async () => {
    setError(null);
    try {
      await dispatch(fetchMyBookings({ page: 1, limit: 20 })).unwrap();
    } catch (error) {
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
    const isPaymentCompleted =
      paymentStatusStr === 'completed' ||
      paymentStatusStr === 'paid' ||
      bookingStatus === 'confirmed' ||
      bookingStatus === 'assigned' ||
      (paymentSegments.length > 0 && paymentSegments.every((seg: any) => seg.status === 'paid')) ||
      (hasQuote && paidAmount >= quoteAmount);

    // Calculate remaining amount - if payment is completed, remaining should be 0
    const remainingAmount =
      hasQuote && !isPaymentCompleted ? Math.max(0, quoteAmount - paidAmount) : 0;

    // Handle worker assignment - check if it exists and is not null
    let workerName: string | undefined;
    let workerPhone: string | undefined;

    try {
      const workerAssignment = (booking as any).worker_assignment;

      if (workerAssignment && typeof workerAssignment === 'object' && workerAssignment !== null) {
        // Try different possible structures
        const worker = workerAssignment.worker || workerAssignment;

        if (worker && typeof worker === 'object' && worker !== null) {
          workerName =
            worker.name || worker.contact_info?.name || worker.contact_person_name || worker.Name;
          workerPhone =
            worker.phone ||
            worker.contact_info?.phone ||
            worker.contact_person_phone ||
            worker.Phone;
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
        activeOpacity={0.7}>
        <View className="px-6 py-4">
          {/* Header: Service Name and Status */}
          <View className="mb-2 flex-row items-start justify-between">
            <View className="mr-3 flex-1">
              <Text
                className="font-bold text-base text-[#111928]"
                style={{ fontFamily: 'Inter-Bold' }}
                numberOfLines={2}>
                {booking.service?.name || 'Service'}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              {isInquiry && (
                <View className="rounded-lg bg-[#3B82F6] px-2.5 py-1.5">
                  <Text
                    className="font-semibold text-xs text-white"
                    style={{ fontFamily: 'Inter-SemiBold' }}>
                    Inquiry
                  </Text>
                </View>
              )}
              <View className="rounded-lg px-3 py-1.5" style={{ backgroundColor: statusColor }}>
                <Text
                  className="font-semibold text-xs text-white"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  {statusLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* Booking ID */}
          <View className="mb-3">
            <Text
              className="mb-1 font-semibold text-xs text-[#6B7280]"
              style={{ fontFamily: 'Inter-SemiBold' }}>
              BOOKING ID
            </Text>
            <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Medium' }}>
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
                    className="mb-1 font-semibold text-xs text-[#6B7280]"
                    style={{ fontFamily: 'Inter-SemiBold' }}>
                    CONTACT PERSON
                  </Text>
                  <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Medium' }}>
                    {contactPerson}
                    {contactPhone && ` • ${contactPhone}`}
                  </Text>
                </View>
              )}

              {/* Description */}
              {description && (
                <View className="mb-3">
                  <Text
                    className="mb-1 font-semibold text-xs text-[#6B7280]"
                    style={{ fontFamily: 'Inter-SemiBold' }}>
                    DESCRIPTION
                  </Text>
                  <Text
                    className="text-sm leading-5 text-[#4B5563]"
                    style={{ fontFamily: 'Inter-Regular' }}>
                    {description}
                  </Text>
                </View>
              )}

              {/* Quote Information */}
              {hasQuote ? (
                <View className="mb-3">
                  <Text
                    className="mb-1 font-semibold text-xs text-[#6B7280]"
                    style={{ fontFamily: 'Inter-SemiBold' }}>
                    QUOTE AMOUNT
                  </Text>
                  <View className="mb-1 flex-row items-center justify-between">
                    <Text
                      className="font-bold text-xl text-[#00a871]"
                      style={{ fontFamily: 'Inter-Bold' }}>
                      ₹{quoteAmount.toLocaleString('en-IN')}
                    </Text>
                    {paidAmount > 0 && (
                      <View className="rounded bg-[#D1FAE5] px-2 py-0.5">
                        <Text
                          className="font-semibold text-xs"
                          style={{ fontFamily: 'Inter-SemiBold', color: '#065F46' }}>
                          Paid: ₹{paidAmount.toLocaleString('en-IN')}
                        </Text>
                      </View>
                    )}
                  </View>
                  {remainingAmount > 0 && (
                    <View className="mb-2 flex-row items-center gap-2">
                      <Text
                        className="text-xs text-[#6B7280]"
                        style={{ fontFamily: 'Inter-Regular' }}>
                        Remaining: ₹{remainingAmount.toLocaleString('en-IN')}
                      </Text>
                      {bookingStatusForSheet === 'partially_paid' && (
                        <View className="rounded bg-[#FEF3C7] px-2 py-0.5">
                          <Text
                            className="font-semibold text-xs"
                            style={{ fontFamily: 'Inter-SemiBold', color: '#92400E' }}>
                            Tap to Pay
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  {quoteProvidedAt && (
                    <Text
                      className="text-xs text-[#6B7280]"
                      style={{ fontFamily: 'Inter-Regular' }}>
                      Quote provided on {formatDate(quoteProvidedAt)}
                    </Text>
                  )}
                </View>
              ) : (
                <View className="-mx-6 mt-1 border-y border-[#E5E7EB] bg-[#F9FAFB] px-6 py-3">
                  <Text
                    className="mb-1.5 font-semibold text-xs text-[#6B7280]"
                    style={{ fontFamily: 'Inter-SemiBold' }}>
                    NOTE
                  </Text>
                  <Text
                    className="text-sm leading-5 text-[#4B5563]"
                    style={{ fontFamily: 'Inter-Regular' }}>
                    Please wait for TreesIndia to provide you the quote. TreesIndia support might
                    contact you regarding your booking.
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
                  className="mb-1 font-semibold text-xs text-[#6B7280]"
                  style={{ fontFamily: 'Inter-SemiBold' }}>
                  SERVICE DATE
                </Text>
                {displayDate ? (
                  <View className="flex-row items-center">
                    <CalendarIcon size={14} color="#111928" />
                    <Text
                      className="ml-2 text-sm text-[#111928]"
                      style={{ fontFamily: 'Inter-Medium' }}
                      numberOfLines={1}>
                      {formatDate(displayDate)}
                      {displayTime && ` • ${formatTime(displayTime)}`}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
                    To be scheduled after quote acceptance
                  </Text>
                )}
              </View>

              {/* Worker Assignment */}
              {workerName && (
                <View className="mb-3">
                  <Text
                    className="mb-1 font-semibold text-xs text-[#6B7280]"
                    style={{ fontFamily: 'Inter-SemiBold' }}>
                    WORKER ASSIGNED
                  </Text>
                  <Text className="text-sm text-[#111928]" style={{ fontFamily: 'Inter-Medium' }}>
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
                      className="mb-1 font-semibold text-xs text-[#6B7280]"
                      style={{ fontFamily: 'Inter-SemiBold' }}>
                      TOTAL AMOUNT
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text
                        className="font-bold text-xl text-[#00a871]"
                        style={{ fontFamily: 'Inter-Bold' }}
                        numberOfLines={1}>
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </Text>
                      {((paymentStatus as string) === 'paid' ||
                        (paymentStatus as string) === 'completed') && (
                        <View
                          className="rounded-lg px-3 py-1.5"
                          style={{
                            backgroundColor: '#D1FAE5',
                          }}>
                          <Text
                            className="font-bold text-xs"
                            style={{
                              fontFamily: 'Inter-Bold',
                              color: '#065F46',
                            }}>
                            PAID
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ) : (
                  <View className="-mx-6 border-y border-[#E5E7EB] bg-[#F9FAFB] px-6 py-3">
                    <Text
                      className="mb-1.5 font-semibold text-xs text-[#6B7280]"
                      style={{ fontFamily: 'Inter-SemiBold' }}>
                      NOTE
                    </Text>
                    <Text
                      className="text-sm leading-5 text-[#4B5563]"
                      style={{ fontFamily: 'Inter-Regular' }}>
                      Please wait for TreesIndia to provide you the quote. TreesIndia support might
                      contact you regarding your booking.
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Accept/Reject/View Quote Buttons - Only for quote_provided status */}
          {isInquiry && (booking as any).status === 'quote_provided' && hasQuote && (
            <View className="mt-4 border-t border-[#E5E7EB] pb-4 pt-4">
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
                        await new Promise((resolve) => setTimeout(resolve, 300));
                      }

                      setIsAcceptingQuote(true);
                      try {
                        await bookingService.acceptQuote(
                          bookingId,
                          'Quote accepted via mobile app'
                        );
                        // Refresh bookings to get updated status
                        await dispatch(fetchMyBookings({ page: 1, limit: 20 }));
                        // Use current booking with updated status (will be refreshed from API)
                        const updatedBooking = { ...booking, status: 'quote_accepted' as const };
                        // Open quote acceptance bottom sheet
                        setBookingForQuote(updatedBooking);
                        setShowQuoteAcceptanceSheet(true);
                      } catch (error: any) {
                        Alert.alert(
                          'Error',
                          error?.message || 'Failed to accept quote. Please try again.'
                        );
                      } finally {
                        setIsAcceptingQuote(false);
                      }
                    }}
                    disabled={isAcceptingQuote}
                    className="flex-1 items-center justify-center rounded-lg bg-[#055c3a] py-2.5"
                    activeOpacity={0.8}>
                    {isAcceptingQuote ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text
                        className="font-semibold text-sm text-white"
                        style={{ fontFamily: 'Inter-SemiBold' }}>
                        Accept
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                <View className="flex-1">
                  <TouchableOpacity
                    onPress={async () => {
                      Alert.alert('Reject Quote', 'Are you sure you want to reject this quote?', [
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
                              Alert.alert(
                                'Error',
                                error?.message || 'Failed to reject quote. Please try again.'
                              );
                            } finally {
                              setIsRejectingQuote(false);
                            }
                          },
                        },
                      ]);
                    }}
                    disabled={isRejectingQuote}
                    className="flex-1 items-center justify-center rounded-lg border border-[#055c3a] bg-transparent py-2.5"
                    activeOpacity={0.8}>
                    {isRejectingQuote ? (
                      <ActivityIndicator size="small" color="#055c3a" />
                    ) : (
                      <Text
                        className="font-semibold text-sm text-[#055c3a]"
                        style={{ fontFamily: 'Inter-SemiBold' }}>
                        Reject
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Pay Button for quote_accepted status with remaining payment */}
          {isInquiry &&
            (booking as any).status === 'quote_accepted' &&
            hasQuote &&
            remainingAmount > 0 && (
              <View className="mt-4 border-t border-[#E5E7EB] pt-4">
                <Button
                  label={`Pay ₹${remainingAmount.toLocaleString('en-IN')}`}
                  onPress={async () => {
                    // Close detail sheet first if open
                    if (showDetailSheet && selectedBooking?.id === booking.id) {
                      setShowDetailSheet(false);
                      setSelectedBooking(null);
                      // Wait a bit for animation to complete
                      await new Promise((resolve) => setTimeout(resolve, 300));
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
        <View className="-mx-6 h-px bg-[#E5E7EB]" />
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
          <Text className="mb-4 text-4xl" style={{ fontFamily: 'Inter-Regular' }}>
            ⚠️
          </Text>
          <Text
            className="mb-4 text-center text-base text-[#B3261E]"
            style={{ fontFamily: 'Inter-Regular' }}>
            {error}
          </Text>
          <TouchableOpacity onPress={loadBookings} className="rounded-lg bg-[#055c3a] px-6 py-3">
            <Text className="font-semibold text-white" style={{ fontFamily: 'Inter-SemiBold' }}>
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
            className="mb-2 mt-4 text-center font-semibold text-lg text-[#4B5563]"
            style={{ fontFamily: 'Inter-SemiBold' }}>
            No {activeTab} bookings
          </Text>
          <Text
            className="text-center text-sm text-[#6B7280]"
            style={{ fontFamily: 'Inter-Regular' }}>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#055c3a" />
        }>
        {filteredBookings.map((booking, index) =>
          renderBookingCard(booking, index, filteredBookings.length)
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center border-b border-[#E5E7EB] px-6 py-4">
        <Text
          className="flex-1 font-semibold text-xl text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          My Bookings
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-[#E5E7EB]">
        <TouchableOpacity
          onPress={() => setActiveTab('ongoing')}
          className="flex-1"
          activeOpacity={0.7}>
          <View
            className={`border-b-2 px-6 py-4 ${
              activeTab === 'ongoing' ? 'border-[#055c3a]' : 'border-transparent'
            }`}>
            <Text
              className="text-center font-medium text-base"
              style={{
                fontFamily: 'Inter-Medium',
                color: activeTab === 'ongoing' ? '#055c3a' : '#6B7280',
              }}>
              Ongoing
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          className="flex-1"
          activeOpacity={0.7}>
          <View
            className={`border-b-2 px-6 py-4 ${
              activeTab === 'completed' ? 'border-[#055c3a]' : 'border-transparent'
            }`}>
            <Text
              className="text-center font-medium text-base"
              style={{
                fontFamily: 'Inter-Medium',
                color: activeTab === 'completed' ? '#055c3a' : '#6B7280',
              }}>
              Completed
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderContent()}

      {/* Global loading overlay while bookings are refreshing (e.g. after payment) */}
      {isLoading && bookings.length > 0 && (
        <View className="absolute inset-0 items-center justify-center bg-black/10">
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
