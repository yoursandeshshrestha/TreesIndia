import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/get_bookings_usecase.dart';
import '../../domain/usecases/cancel_booking_usecase.dart';
import '../../domain/entities/booking_details_entity.dart';
import 'bookings_state.dart';

class BookingsNotifier extends StateNotifier<BookingsState> {
  final GetBookingsUseCase getBookingsUseCase;
  final CancelBookingUseCase cancelBookingUseCase;
  Timer? _autoRefreshTimer;

  BookingsNotifier({
    required this.getBookingsUseCase,
    required this.cancelBookingUseCase,
  }) : super(const BookingsState()) {
    _startAutoRefresh();
  }

  void _startAutoRefresh() {
    _autoRefreshTimer?.cancel();
    _autoRefreshTimer = Timer.periodic(const Duration(seconds: 60), (timer) {
      if (state.currentBookings.isNotEmpty) {
        _refreshCurrentTab();
      }
    });
  }

  void _refreshCurrentTab() {
    switch (state.currentTab) {
      case BookingTab.all:
        getBookings(tab: BookingTab.all, isRefresh: true);
        break;
      case BookingTab.upcoming:
        getBookings(tab: BookingTab.upcoming, isRefresh: true);
        break;
      case BookingTab.completed:
        getBookings(tab: BookingTab.completed, isRefresh: true);
        break;
      case BookingTab.cancelled:
        getBookings(tab: BookingTab.cancelled, isRefresh: true);
        break;
    }
  }

  void switchTab(BookingTab tab) {
    state = state.copyWith(currentTab: tab);

    // Load data for the new tab if it's empty
    if (state.currentBookings.isEmpty) {
      getBookings(tab: tab, page: 1);
    }
  }

  Future<void> getBookings({
    BookingTab tab = BookingTab.all,
    bool isRefresh = false,
    int? page,
  }) async {
    final currentPage = page ?? state.currentTabPage;

    if (isRefresh) {
      state = state.copyWith(
        isRefreshing: true,
        errorMessage: '',
      );
    } else {
      state = state.copyWith(
        status: BookingsStatus.loading,
        errorMessage: '',
      );
    }

    try {
      final response = await getBookingsUseCase.call(
        page: isRefresh ? 1 : currentPage,
        limit: 10,
        tab: tab,
      );

      final newBookings = response.bookings;
      final hasMore = response.pagination.page < response.pagination.totalPages;

      if (isRefresh) {
        _updateTabBookings(tab, newBookings, 2, hasMore);
        state = state.copyWith(isRefreshing: false);
      } else {
        final updatedBookings = currentPage == 1
            ? newBookings
            : [...state.currentBookings, ...newBookings];
        _updateTabBookings(tab, updatedBookings, currentPage + 1, hasMore);
        state = state.copyWith(
          status: BookingsStatus.success,
          isLoadingMore: false,
        );
      }
    } catch (e) {
      if (isRefresh) {
        state = state.copyWith(
          isRefreshing: false,
          errorMessage: e.toString(),
        );
      } else {
        state = state.copyWith(
          status: BookingsStatus.failure,
          isLoadingMore: false,
          errorMessage: e.toString(),
        );
      }
    }
  }

  void _updateTabBookings(BookingTab tab, List<BookingDetailsEntity> bookings,
      int nextPage, bool hasMore) {
    switch (tab) {
      case BookingTab.all:
        state = state.copyWith(
          allBookings: bookings,
          allCurrentPage: nextPage,
          allHasMore: hasMore,
        );
        break;
      case BookingTab.upcoming:
        state = state.copyWith(
          upcomingBookings: bookings,
          upcomingCurrentPage: nextPage,
          upcomingHasMore: hasMore,
        );
        break;
      case BookingTab.completed:
        state = state.copyWith(
          completedBookings: bookings,
          completedCurrentPage: nextPage,
          completedHasMore: hasMore,
        );
        break;
      case BookingTab.cancelled:
        state = state.copyWith(
          cancelledBookings: bookings,
          cancelledCurrentPage: nextPage,
          cancelledHasMore: hasMore,
        );
        break;
    }
  }

  Future<void> loadMoreBookings() async {
    if (state.isLoadingMore || !state.currentTabHasMore) return;

    state = state.copyWith(isLoadingMore: true);

    try {
      final response = await getBookingsUseCase.call(
        page: state.currentTabPage,
        limit: 10,
        tab: state.currentTab,
      );

      final newBookings = response.bookings;
      final hasMore = response.pagination.page < response.pagination.totalPages;

      final updatedBookings = [...state.currentBookings, ...newBookings];
      _updateTabBookings(
          state.currentTab, updatedBookings, state.currentTabPage + 1, hasMore);

      state = state.copyWith(isLoadingMore: false);
    } catch (e) {
      state = state.copyWith(
        isLoadingMore: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> cancelBooking({
    required int bookingId,
    required String reason,
    String? cancellationReason,
  }) async {
    state = state.copyWith(
      isCancelling: true,
      errorMessage: '',
    );

    try {
      await cancelBookingUseCase.call(
        bookingId: bookingId,
        reason: reason,
        cancellationReason: cancellationReason,
      );

      // Update the booking status in all relevant tab lists
      final updatedAllBookings = state.allBookings.map((booking) {
        if (booking.id == bookingId) {
          return booking.copyWith(status: 'cancelled');
        }
        return booking;
      }).toList();

      final updatedUpcomingBookings = state.upcomingBookings.map((booking) {
        if (booking.id == bookingId) {
          return booking.copyWith(status: 'cancelled');
        }
        return booking;
      }).toList();

      state = state.copyWith(
        allBookings: updatedAllBookings,
        upcomingBookings: updatedUpcomingBookings,
        isCancelling: false,
        errorMessage: '',
      );
    } catch (e) {
      state = state.copyWith(
        isCancelling: false,
        errorMessage: e.toString(),
      );
      rethrow;
    }
  }

  void refresh() {
    _refreshCurrentTab();
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    super.dispose();
  }
}
