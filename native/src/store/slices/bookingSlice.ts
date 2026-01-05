import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BookingState, BookingConfig } from '../../types/booking';
import { bookingService } from '../../services';

// Initial state
const initialState: BookingState = {
  bookings: [],
  pagination: null,
  bookingConfig: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchBookingConfig = createAsyncThunk(
  'booking/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      const config = await bookingService.getBookingConfig();
      return config;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch booking config';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'booking/fetchMyBookings',
  async (
    { page, limit }: { page: number; limit: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await bookingService.getMyBookings(page, limit);
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch bookings';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'booking/fetchBookingById',
  async (bookingId: number, { rejectWithValue }) => {
    try {
      const booking = await bookingService.getBookingById(bookingId);
      return booking;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch booking details';
      return rejectWithValue(errorMessage);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async (
    { bookingId, reason }: { bookingId: number; reason?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await bookingService.cancelBooking(bookingId, reason);
      return { bookingId, ...response };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to cancel booking';
      return rejectWithValue(errorMessage);
    }
  }
);

// Booking slice
const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearBookings: (state) => {
      state.bookings = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch booking config
    builder
      .addCase(fetchBookingConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookingConfig = action.payload;
        state.error = null;
      })
      .addCase(fetchBookingConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch my bookings
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        console.log('[bookingSlice] fetchMyBookings pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        console.log('[bookingSlice] fetchMyBookings fulfilled - Full payload:', action.payload);
        console.log('[bookingSlice] Payload structure:', {
          hasData: !!action.payload.data,
          hasPagination: !!action.payload.pagination,
          dataType: typeof action.payload.data,
          dataIsArray: Array.isArray(action.payload.data),
          dataLength: action.payload.data?.length,
        });
        state.isLoading = false;
        state.bookings = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
        console.log('[bookingSlice] State updated - bookings count:', state.bookings.length);
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        console.error('[bookingSlice] fetchMyBookings rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch booking by ID
    builder
      .addCase(fetchBookingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update or add the booking in the list
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        } else {
          state.bookings.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Cancel booking
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the booking status in the list
        const index = state.bookings.findIndex((b) => b.id === action.payload.bookingId);
        if (index !== -1) {
          state.bookings[index].status = 'cancelled';
        }
        state.error = null;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading, clearBookings } = bookingSlice.actions;
export default bookingSlice.reducer;
