import { API_BASE_URL, authenticatedFetch, handleResponse } from './base';
import {
  TimeSlot,
  BookingConfig,
  CreateBookingRequest,
  CreateInquiryRequest,
  BookingResponse,
  BookingsListResponse,
  RazorpayData,
  Booking,
  PaymentVerificationResponse,
} from '../../types/booking';
import { bookingLogger } from '../../utils/logger';

class BookingService {
  /**
   * Get booking configuration (inquiry fee, working hours, etc.)
   */
  async getBookingConfig(): Promise<BookingConfig> {
    const response = await authenticatedFetch(`${API_BASE_URL}/bookings/config`);
    return handleResponse<BookingConfig>(response);
  }

  /**
   * Get available time slots for a service
   */
  async getAvailableSlots(
    serviceId: number,
    date: string,
    duration?: string
  ): Promise<TimeSlot[]> {
    console.log('[BookingService] getAvailableSlots called with:', {
      serviceId,
      date,
      duration,
      durationType: typeof duration,
      hasDuration: duration !== undefined && duration !== null,
    });

    let url = `${API_BASE_URL}/bookings/available-slots?service_id=${serviceId}&date=${date}`;
    if (duration) {
      const encodedDuration = encodeURIComponent(duration);
      url += `&duration=${encodedDuration}`;
      console.log('[BookingService] Added duration to URL:', {
        originalDuration: duration,
        encodedDuration,
        fullUrl: url,
      });
    } else {
      console.log('[BookingService] No duration provided, using service default');
    }

    console.log('[BookingService] Making request to:', url);

    try {
      const response = await authenticatedFetch(url);
      
      console.log('[BookingService] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[BookingService] Response not OK:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });
        throw new Error(`Failed to get available slots: ${response.status} ${response.statusText}`);
      }

      const rawData = await response.json();
      console.log('[BookingService] Raw response data:', {
        dataType: typeof rawData,
        isArray: Array.isArray(rawData),
        keys: rawData && typeof rawData === 'object' ? Object.keys(rawData) : 'N/A',
        hasData: rawData && typeof rawData === 'object' && 'data' in rawData,
        hasAvailableSlots: rawData && typeof rawData === 'object' && 'available_slots' in rawData,
        hasSlots: rawData && typeof rawData === 'object' && 'slots' in rawData,
        dataPreview: JSON.stringify(rawData).substring(0, 500),
      });

      const data = rawData as {
        data?: {
          available_slots?: TimeSlot[];
        };
        available_slots?: TimeSlot[];
        slots?: TimeSlot[];
      } | TimeSlot[];

      // Handle different response formats (matching web app)
      let slots: any[] = [];
      
      if (Array.isArray(data)) {
        console.log('[BookingService] Response is array:', {
          length: data.length,
        });
        slots = data;
      } else if (data && typeof data === 'object' && 'data' in data) {
        console.log('[BookingService] Response has data field:', {
          hasData: !!data.data,
          hasAvailableSlots: !!(data.data && typeof data.data === 'object' && 'available_slots' in data.data),
        });
        if (data.data?.available_slots) {
          slots = data.data.available_slots;
        }
      } else if (data && typeof data === 'object' && 'available_slots' in data) {
        console.log('[BookingService] Response has available_slots field:', {
          isArray: Array.isArray(data.available_slots),
          length: Array.isArray(data.available_slots) ? data.available_slots.length : 'N/A',
        });
        if (Array.isArray(data.available_slots)) {
          slots = data.available_slots;
        }
      } else if (data && typeof data === 'object' && 'slots' in data) {
        console.log('[BookingService] Response has slots field:', {
          isArray: Array.isArray(data.slots),
          length: Array.isArray(data.slots) ? data.slots.length : 'N/A',
        });
        if (Array.isArray(data.slots)) {
          slots = data.slots;
        }
      }
      
      // Map slots to TimeSlot format - handle both 'time' and 'start_time' properties
      const mappedSlots: TimeSlot[] = slots.map((slot: any, index: number) => {
        // Handle API response format where 'time' is used instead of 'start_time'
        const startTime = slot.start_time || slot.time;
        const endTime = slot.end_time;
        
        // If we have start_time but no end_time, calculate it from duration
        let calculatedEndTime = endTime;
        if (startTime && !endTime && duration) {
          // Parse duration (e.g., "2 hours" or "120" minutes)
          let durationMinutes = 120; // default 2 hours
          if (typeof duration === 'string') {
            const hoursMatch = duration.match(/(\d+)\s*hours?/i);
            const minutesMatch = duration.match(/(\d+)\s*minutes?/i);
            if (hoursMatch) {
              durationMinutes = parseInt(hoursMatch[1], 10) * 60;
            } else if (minutesMatch) {
              durationMinutes = parseInt(minutesMatch[1], 10);
            } else {
              // Try parsing as number (minutes)
              const num = parseInt(duration, 10);
              if (!isNaN(num)) {
                durationMinutes = num;
              }
            }
          }
          
          // Calculate end time
          const [hours, minutes] = startTime.split(':').map(Number);
          const startDate = new Date();
          startDate.setHours(hours, minutes || 0, 0, 0);
          startDate.setMinutes(startDate.getMinutes() + durationMinutes);
          calculatedEndTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
        }
        
        return {
          id: slot.id || `slot-${index}`,
          start_time: startTime || '',
          end_time: calculatedEndTime || startTime || '',
          is_available: slot.is_available !== false,
          available_workers: slot.available_workers,
        };
      });
      
      console.log('[BookingService] Mapped slots:', {
        originalCount: slots.length,
        mappedCount: mappedSlots.length,
        sampleSlot: mappedSlots[0],
      });
      
      return mappedSlots;
    } catch (error) {
      console.error('[BookingService] Error in getAvailableSlots:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'N/A',
        serviceId,
        date,
        duration,
      });
      throw error;
    }
  }

  /**
   * Check if a service is available in a specific location
   */
  async checkServiceAvailability(
    serviceId: number,
    city: string,
    state: string,
    pincode?: string
  ): Promise<boolean> {
    // Trim and clean input parameters
    const cleanCity = city.trim();
    const cleanState = state.trim();
    const cleanPincode = pincode?.trim();

    bookingLogger.api('GET', `/service-availability/${serviceId}`, 'start', {
      service_id: serviceId,
      city: cleanCity,
      state: cleanState,
      pincode: cleanPincode,
    });

    // Build URL with proper encoding (matching web implementation)
    let url = `${API_BASE_URL}/service-availability/${serviceId}?city=${encodeURIComponent(
      cleanCity
    )}&state=${encodeURIComponent(cleanState)}`;

    if (cleanPincode) {
      url += `&pincode=${encodeURIComponent(cleanPincode)}`;
    }

    try {
      const response = await authenticatedFetch(url);

      // handleResponse returns the unwrapped data (data.data), which is a boolean
      const isAvailable = await handleResponse<boolean>(response);

      bookingLogger.api('GET', `/service-availability/${serviceId}`, 'success', {
        is_available: isAvailable,
      });

      return isAvailable;
    } catch (error) {
      bookingLogger.api('GET', `/service-availability/${serviceId}`, 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        city: cleanCity,
        state: cleanState,
        pincode: cleanPincode,
      });
      throw error;
    }
  }

  /**
   * Create a fixed-price booking with Razorpay payment
   */
  async createBooking(data: CreateBookingRequest): Promise<BookingResponse> {
    bookingLogger.api('POST', '/bookings', 'start', { service_id: data.service_id });

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await handleResponse<BookingResponse>(response);

      // Debug logging to see response structure
      bookingLogger.debug('Booking Razorpay response structure', {
        result_type: typeof result,
        has_booking: result && typeof result === 'object' ? 'booking' in result : false,
        booking_type: result && typeof result === 'object' && 'booking' in result ? typeof result.booking : 'N/A',
        booking_keys: result && typeof result === 'object' && 'booking' in result && result.booking && typeof result.booking === 'object' ? Object.keys(result.booking).join(', ') : 'N/A',
        booking_id: result && typeof result === 'object' && 'booking' in result && result.booking ? result.booking.id : undefined,
        booking_ID: result && typeof result === 'object' && 'booking' in result && result.booking ? result.booking.ID : undefined,
        has_payment_order: result && typeof result === 'object' ? 'payment_order' in result : false,
        result_keys: result && typeof result === 'object' ? Object.keys(result).join(', ') : 'N/A',
      });

      bookingLogger.api('POST', '/bookings', 'success', {
        booking_id: result?.booking?.ID || result?.booking?.id,
        payment_required: result?.payment_required,
      });

      return result;
    } catch (error) {
      bookingLogger.api('POST', '/bookings', 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Create a fixed-price booking with Wallet payment
   */
  async createBookingWithWallet(data: CreateBookingRequest): Promise<BookingResponse> {
    bookingLogger.api('POST', '/bookings/wallet', 'start', { service_id: data.service_id });

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/bookings/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await handleResponse<BookingResponse>(response);

      // Debug logging to see response structure
      bookingLogger.debug('Booking wallet response structure', {
        result_type: typeof result,
        has_booking: result && typeof result === 'object' ? 'booking' in result : false,
        booking_type: result && typeof result === 'object' && 'booking' in result ? typeof result.booking : 'N/A',
        booking_keys: result && typeof result === 'object' && 'booking' in result && result.booking && typeof result.booking === 'object' ? Object.keys(result.booking).join(', ') : 'N/A',
        booking_id: result && typeof result === 'object' && 'booking' in result && result.booking ? result.booking.id : undefined,
        booking_ID: result && typeof result === 'object' && 'booking' in result && result.booking ? result.booking.ID : undefined,
        result_keys: result && typeof result === 'object' ? Object.keys(result).join(', ') : 'N/A',
      });

      bookingLogger.api('POST', '/bookings/wallet', 'success', {
        booking_id: result?.booking?.ID || result?.booking?.id,
      });

      return result;
    } catch (error) {
      bookingLogger.api('POST', '/bookings/wallet', 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Verify payment for a fixed-price booking
   */
  async verifyBookingPayment(
    bookingId: number,
    razorpayData: RazorpayData
  ): Promise<PaymentVerificationResponse> {
    bookingLogger.api('POST', `/bookings/${bookingId}/verify-payment`, 'start', {
      booking_id: bookingId,
      order_id: razorpayData.razorpay_order_id,
    });

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/bookings/${bookingId}/verify-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(razorpayData),
        }
      );

      const result = await handleResponse<PaymentVerificationResponse>(response);
      bookingLogger.api('POST', `/bookings/${bookingId}/verify-payment`, 'success', {
        success: result.success,
        booking_id: result.data?.booking?.ID || result.data?.booking?.id,
      });

      return result;
    } catch (error) {
      bookingLogger.api('POST', `/bookings/${bookingId}/verify-payment`, 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Create an inquiry booking with Razorpay payment
   */
  async createInquiry(data: CreateInquiryRequest): Promise<BookingResponse> {
    bookingLogger.api('POST', '/bookings/inquiry', 'start', { service_id: data.service_id });

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/bookings/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await handleResponse<BookingResponse>(response);

      // Debug logging to see response structure
      bookingLogger.debug('Inquiry Razorpay response structure', {
        result_type: typeof result,
        has_booking: result && typeof result === 'object' ? 'booking' in result : false,
        booking_type: result && typeof result === 'object' && 'booking' in result ? typeof result.booking : 'N/A',
        booking_keys: result && typeof result === 'object' && 'booking' in result && result.booking && typeof result.booking === 'object' ? Object.keys(result.booking).join(', ') : 'N/A',
        booking_id: result && typeof result === 'object' && 'booking' in result && result.booking ? result.booking.id : undefined,
        booking_ID: result && typeof result === 'object' && 'booking' in result && result.booking ? result.booking.ID : undefined,
        has_payment_order: result && typeof result === 'object' ? 'payment_order' in result : false,
        result_keys: result && typeof result === 'object' ? Object.keys(result).join(', ') : 'N/A',
      });

      bookingLogger.api('POST', '/bookings/inquiry', 'success', {
        booking_id: result?.booking?.ID || result?.booking?.id,
      });

      return result;
    } catch (error) {
      bookingLogger.api('POST', '/bookings/inquiry', 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Create an inquiry booking with Wallet payment
   */
  async createInquiryWithWallet(data: CreateInquiryRequest): Promise<BookingResponse> {
    bookingLogger.api('POST', '/bookings/inquiry/wallet', 'start', { service_id: data.service_id });

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/bookings/inquiry/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await handleResponse<BookingResponse>(response);

      // Debug logging to see response structure
      bookingLogger.debug('Inquiry wallet response structure', {
        result_type: typeof result,
        has_booking: result && typeof result === 'object' ? 'booking' in result : false,
        booking_type: result && typeof result === 'object' && 'booking' in result ? typeof result.booking : 'N/A',
        booking_keys: result && typeof result === 'object' && 'booking' in result && result.booking && typeof result.booking === 'object' ? Object.keys(result.booking).join(', ') : 'N/A',
        booking_id: result && typeof result === 'object' && 'booking' in result && result.booking ? result.booking.id : undefined,
        booking_ID: result && typeof result === 'object' && 'booking' in result && result.booking ? result.booking.ID : undefined,
        result_keys: result && typeof result === 'object' ? Object.keys(result).join(', ') : 'N/A',
      });

      bookingLogger.api('POST', '/bookings/inquiry/wallet', 'success', {
        booking_id: result?.booking?.ID || result?.booking?.id,
      });

      return result;
    } catch (error) {
      bookingLogger.api('POST', '/bookings/inquiry/wallet', 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Verify payment for an inquiry booking
   */
  async verifyInquiryPayment(
    serviceId: number,
    razorpayData: RazorpayData
  ): Promise<PaymentVerificationResponse> {
    bookingLogger.api('POST', '/bookings/inquiry/verify-payment', 'start', {
      service_id: serviceId,
      order_id: razorpayData.razorpay_order_id,
    });

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/bookings/inquiry/verify-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: serviceId,
            ...razorpayData,
          }),
        }
      );

      const result = await handleResponse<PaymentVerificationResponse>(response);
      bookingLogger.api('POST', '/bookings/inquiry/verify-payment', 'success', {
        success: result.success,
        booking_id: result.data?.booking?.ID || result.data?.booking?.id,
      });

      return result;
    } catch (error) {
      bookingLogger.api('POST', '/bookings/inquiry/verify-payment', 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get user's bookings
   */
  async getMyBookings(page: number = 1, limit: number = 10): Promise<BookingsListResponse> {
    console.log('[BookingService] getMyBookings called with:', { page, limit });

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/bookings?${params.toString()}`);
      console.log('[BookingService] Response status:', response.status);

      const rawData = await handleResponse<BookingsListResponse | { data: Booking[] } | { bookings: Booking[] }>(response);
      console.log('[BookingService] Raw response data:', rawData);
      console.log('[BookingService] Response structure:', {
        hasSuccess: 'success' in rawData,
        hasData: 'data' in rawData,
        hasBookings: 'bookings' in rawData,
        hasPagination: 'pagination' in rawData,
        dataType: 'data' in rawData ? typeof rawData.data : 'N/A',
        bookingsType: 'bookings' in rawData ? typeof (rawData as { bookings: unknown }).bookings : 'N/A',
        dataIsArray: 'data' in rawData ? Array.isArray(rawData.data) : false,
        bookingsIsArray: 'bookings' in rawData ? Array.isArray((rawData as { bookings: unknown }).bookings) : false,
        dataLength: 'data' in rawData && Array.isArray(rawData.data) ? rawData.data.length : 0,
        bookingsLength: 'bookings' in rawData && Array.isArray((rawData as { bookings: unknown }).bookings) ? (rawData as { bookings: Booking[] }).bookings.length : 0,
      });

      // Handle format with 'bookings' field (actual API response)
      if ('bookings' in rawData && Array.isArray((rawData as { bookings: unknown }).bookings)) {
        console.log('[BookingService] Using format 0 (bookings field from API)');
        const bookingsData = (rawData as { bookings: Booking[]; pagination?: { page: number; limit: number; total: number; total_pages: number } }).bookings;
        const paginationData = (rawData as { bookings: Booking[]; pagination?: { page: number; limit: number; total: number; total_pages: number } }).pagination;
        const normalizedResponse = {
          success: true,
          data: bookingsData,
          pagination: paginationData || {
            page,
            limit,
            total: bookingsData.length,
            total_pages: 1,
          },
        };
        console.log('[BookingService] Returning normalized from bookings:', {
          dataLength: normalizedResponse.data.length,
          pagination: normalizedResponse.pagination,
        });
        return normalizedResponse;
      }

      // Normalize response
      if ('success' in rawData && 'data' in rawData && 'pagination' in rawData) {
        console.log('[BookingService] Using format 1 (full BookingsListResponse)');
        console.log('[BookingService] Returning:', {
          success: rawData.success,
          dataLength: Array.isArray(rawData.data) ? rawData.data.length : 0,
          pagination: rawData.pagination,
        });
        return rawData as BookingsListResponse;
      }

      // Handle alternative format
      if ('data' in rawData && Array.isArray(rawData.data)) {
        console.log('[BookingService] Using format 2 (data array only)');
        const normalizedResponse = {
          success: true,
          data: rawData.data,
          pagination: {
            page,
            limit,
            total: rawData.data.length,
            total_pages: 1,
          },
        };
        console.log('[BookingService] Returning normalized:', normalizedResponse);
        return normalizedResponse;
      }

      // Fallback
      console.warn('[BookingService] Using fallback (empty response)');
      return {
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          total_pages: 0,
        },
      };
    } catch (error) {
      console.error('[BookingService] Error in getMyBookings:', error);
      throw error;
    }
  }

  /**
   * Get a specific booking by ID
   */
  async getBookingById(bookingId: number): Promise<Booking> {
    const response = await authenticatedFetch(`${API_BASE_URL}/bookings/${bookingId}`);
    const data = await handleResponse<{ booking: Booking } | Booking>(response);

    if ('booking' in data) {
      return data.booking;
    }
    return data as Booking;
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: number, reason?: string): Promise<{ success: boolean; message?: string }> {
    const response = await authenticatedFetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    return handleResponse<{ success: boolean; message?: string }>(response);
  }

  /**
   * Create quote payment order (for Razorpay)
   */
  async createQuotePayment(
    bookingId: number,
    amount: number,
    scheduledDate?: string,
    scheduledTime?: string,
    segmentNumber?: number
  ): Promise<{
    payment_order: {
      id: string;
      amount: number;
      currency: string;
      receipt: string;
      key_id: string;
    };
  }> {
    const requestBody: any = {
      amount,
    };

    if (scheduledDate) {
      requestBody.scheduled_date = scheduledDate;
    }
    if (scheduledTime) {
      requestBody.scheduled_time = scheduledTime;
    }
    if (segmentNumber !== undefined) {
      requestBody.segment_number = segmentNumber;
    }

    console.log('[BookingService] createQuotePayment request', {
      bookingId,
      requestBody,
      url: `${API_BASE_URL}/bookings/${bookingId}/create-quote-payment`,
    });

    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/${bookingId}/create-quote-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('[BookingService] createQuotePayment response status', response.status);

    return handleResponse(response);
  }

  /**
   * Verify quote payment (for Razorpay)
   */
  async verifyQuotePayment(
    bookingId: number,
    razorpayData: RazorpayData
  ): Promise<Booking> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/${bookingId}/verify-quote-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: razorpayData.razorpay_payment_id,
          razorpay_order_id: razorpayData.razorpay_order_id,
          razorpay_signature: razorpayData.razorpay_signature,
        }),
      }
    );

    const data = await handleResponse<{ booking: Booking } | Booking>(response);
    return 'booking' in data ? data.booking : data;
  }

  /**
   * Process wallet payment for quote
   */
  async processQuoteWalletPayment(
    bookingId: number,
    amount: number,
    scheduledDate: string,
    scheduledTime: string
  ): Promise<Booking> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/${bookingId}/wallet-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
        }),
      }
    );

    const data = await handleResponse<{ booking: Booking } | Booking>(response);
    return 'booking' in data ? data.booking : data;
  }

  /**
   * Pay for a specific payment segment (for segmented payments, no date/time required)
   */
  async paySegment(
    bookingId: number,
    segmentNumber: number,
    amount: number,
    paymentMethod: 'wallet' | 'razorpay'
  ): Promise<any> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/${bookingId}/payment-segments/pay`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          segment_number: segmentNumber,
          amount,
          payment_method: paymentMethod,
        }),
      }
    );

    // handleResponse unwraps the "data" field, so this returns the inner data object directly
    // For Razorpay: { payment_order: {...}, segment: {...} }
    // For Wallet: { success: true, payment: {...}, segment: {...} }
    return handleResponse(response);
  }

  /**
   * Verify segment payment (for Razorpay)
   */
  async verifySegmentPayment(
    bookingId: number,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<{ success: boolean; data: any }> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/${bookingId}/payment-segments/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        }),
      }
    );

    return handleResponse<{ success: boolean; data: any }>(response);
  }

  /**
   * Accept a quote for an inquiry booking
   */
  async acceptQuote(bookingId: number, notes?: string): Promise<{ message: string }> {
    console.log('[BookingService] acceptQuote called:', { bookingId, notes });
    
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/${bookingId}/accept-quote`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: notes || '',
        }),
      }
    );

    const data = await handleResponse<{ message: string }>(response);
    console.log('[BookingService] acceptQuote success:', data);
    return data;
  }

  /**
   * Reject a quote for an inquiry booking
   */
  async rejectQuote(bookingId: number, reason: string): Promise<{ message: string }> {
    console.log('[BookingService] rejectQuote called:', { bookingId, reason });
    
    const response = await authenticatedFetch(
      `${API_BASE_URL}/bookings/${bookingId}/reject-quote`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
        }),
      }
    );

    const data = await handleResponse<{ message: string }>(response);
    console.log('[BookingService] rejectQuote success:', data);
    return data;
  }
}

export const bookingService = new BookingService();
