import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/get_bookings_usecase.dart';
import 'bookings_state.dart';

class BookingsNotifier extends StateNotifier<BookingsState> {
  final GetBookingsUseCase getBookingsUseCase;

  BookingsNotifier({
    required this.getBookingsUseCase,
  }) : super(const BookingsState());

  Future<void> getBookings({bool isRefresh = false}) async {
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
        page: isRefresh ? 1 : state.currentPage,
        limit: 10,
      );

      final newBookings = response.bookings;
      final hasMore = response.pagination.page < response.pagination.totalPages;

      if (isRefresh) {
        state = state.copyWith(
          status: BookingsStatus.success,
          bookings: newBookings,
          isRefreshing: false,
          currentPage: 2,
          hasMore: hasMore,
          errorMessage: '',
        );
      } else {
        state = state.copyWith(
          status: BookingsStatus.success,
          bookings: state.currentPage == 1 
              ? newBookings 
              : [...state.bookings, ...newBookings],
          currentPage: state.currentPage + 1,
          hasMore: hasMore,
          isLoadingMore: false,
          errorMessage: '',
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

  Future<void> loadMoreBookings() async {
    if (state.isLoadingMore || !state.hasMore) return;

    state = state.copyWith(isLoadingMore: true);

    try {
      final response = await getBookingsUseCase.call(
        page: state.currentPage,
        limit: 10,
      );

      final newBookings = response.bookings;
      final hasMore = response.pagination.page < response.pagination.totalPages;

      state = state.copyWith(
        bookings: [...state.bookings, ...newBookings],
        currentPage: state.currentPage + 1,
        hasMore: hasMore,
        isLoadingMore: false,
        errorMessage: '',
      );
    } catch (e) {
      state = state.copyWith(
        isLoadingMore: false,
        errorMessage: e.toString(),
      );
    }
  }

  void refresh() {
    getBookings(isRefresh: true);
  }
}