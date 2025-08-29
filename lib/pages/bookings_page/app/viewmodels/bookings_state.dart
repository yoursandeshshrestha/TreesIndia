import 'package:equatable/equatable.dart';
import '../../domain/entities/booking_details_entity.dart';

enum BookingsStatus { initial, loading, success, failure }

class BookingsState extends Equatable {
  final BookingsStatus status;
  final List<BookingDetailsEntity> bookings;
  final bool isLoadingMore;
  final bool hasMore;
  final int currentPage;
  final bool isRefreshing;
  final bool isCancelling;
  final String errorMessage;

  const BookingsState({
    this.status = BookingsStatus.initial,
    this.bookings = const [],
    this.isLoadingMore = false,
    this.hasMore = true,
    this.currentPage = 1,
    this.isRefreshing = false,
    this.isCancelling = false,
    this.errorMessage = '',
  });

  BookingsState copyWith({
    BookingsStatus? status,
    List<BookingDetailsEntity>? bookings,
    bool? isLoadingMore,
    bool? hasMore,
    int? currentPage,
    bool? isRefreshing,
    bool? isCancelling,
    String? errorMessage,
  }) {
    return BookingsState(
      status: status ?? this.status,
      bookings: bookings ?? this.bookings,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      isCancelling: isCancelling ?? this.isCancelling,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status,
        bookings,
        isLoadingMore,
        hasMore,
        currentPage,
        isRefreshing,
        isCancelling,
        errorMessage,
      ];
}
