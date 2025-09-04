import 'package:equatable/equatable.dart';
import '../../domain/entities/booking_details_entity.dart';

enum BookingsStatus { initial, loading, success, failure }

enum BookingTab { all, upcoming, completed, cancelled }

class BookingsState extends Equatable {
  final BookingsStatus status;
  final BookingTab currentTab;

  // Separate booking lists for each tab
  final List<BookingDetailsEntity> allBookings;
  final List<BookingDetailsEntity> upcomingBookings;
  final List<BookingDetailsEntity> completedBookings;
  final List<BookingDetailsEntity> cancelledBookings;

  // Pagination for each tab
  final int allCurrentPage;
  final int upcomingCurrentPage;
  final int completedCurrentPage;
  final int cancelledCurrentPage;

  final bool allHasMore;
  final bool upcomingHasMore;
  final bool completedHasMore;
  final bool cancelledHasMore;

  final bool isLoadingMore;
  final bool hasMore;
  final int currentPage;
  final bool isRefreshing;
  final bool isCancelling;
  final bool isRejectingQuote;
  final bool isAcceptingQuote;
  final String errorMessage;

  const BookingsState({
    this.status = BookingsStatus.initial,
    this.currentTab = BookingTab.all,
    this.allBookings = const [],
    this.upcomingBookings = const [],
    this.completedBookings = const [],
    this.cancelledBookings = const [],
    this.allCurrentPage = 1,
    this.upcomingCurrentPage = 1,
    this.completedCurrentPage = 1,
    this.cancelledCurrentPage = 1,
    this.allHasMore = true,
    this.upcomingHasMore = true,
    this.completedHasMore = true,
    this.cancelledHasMore = true,
    this.isLoadingMore = false,
    this.hasMore = true,
    this.currentPage = 1,
    this.isRefreshing = false,
    this.isCancelling = false,
    this.isRejectingQuote = false,
    this.isAcceptingQuote = false,
    this.errorMessage = '',
  });

  // Getter for current tab's bookings
  List<BookingDetailsEntity> get currentBookings {
    switch (currentTab) {
      case BookingTab.all:
        return allBookings;
      case BookingTab.upcoming:
        return upcomingBookings;
      case BookingTab.completed:
        return completedBookings;
      case BookingTab.cancelled:
        return cancelledBookings;
    }
  }

  // Getter for current tab's page
  int get currentTabPage {
    switch (currentTab) {
      case BookingTab.all:
        return allCurrentPage;
      case BookingTab.upcoming:
        return upcomingCurrentPage;
      case BookingTab.completed:
        return completedCurrentPage;
      case BookingTab.cancelled:
        return cancelledCurrentPage;
    }
  }

  // Getter for current tab's hasMore
  bool get currentTabHasMore {
    switch (currentTab) {
      case BookingTab.all:
        return allHasMore;
      case BookingTab.upcoming:
        return upcomingHasMore;
      case BookingTab.completed:
        return completedHasMore;
      case BookingTab.cancelled:
        return cancelledHasMore;
    }
  }

  BookingsState copyWith({
    BookingsStatus? status,
    BookingTab? currentTab,
    List<BookingDetailsEntity>? allBookings,
    List<BookingDetailsEntity>? upcomingBookings,
    List<BookingDetailsEntity>? completedBookings,
    List<BookingDetailsEntity>? cancelledBookings,
    int? allCurrentPage,
    int? upcomingCurrentPage,
    int? completedCurrentPage,
    int? cancelledCurrentPage,
    bool? allHasMore,
    bool? upcomingHasMore,
    bool? completedHasMore,
    bool? cancelledHasMore,
    bool? isLoadingMore,
    bool? hasMore,
    int? currentPage,
    bool? isRefreshing,
    bool? isCancelling,
    bool? isRejectingQuote,
    bool? isAcceptingQuote,
    String? errorMessage,
  }) {
    return BookingsState(
      status: status ?? this.status,
      currentTab: currentTab ?? this.currentTab,
      allBookings: allBookings ?? this.allBookings,
      upcomingBookings: upcomingBookings ?? this.upcomingBookings,
      completedBookings: completedBookings ?? this.completedBookings,
      cancelledBookings: cancelledBookings ?? this.cancelledBookings,
      allCurrentPage: allCurrentPage ?? this.allCurrentPage,
      upcomingCurrentPage: upcomingCurrentPage ?? this.upcomingCurrentPage,
      completedCurrentPage: completedCurrentPage ?? this.completedCurrentPage,
      cancelledCurrentPage: cancelledCurrentPage ?? this.cancelledCurrentPage,
      allHasMore: allHasMore ?? this.allHasMore,
      upcomingHasMore: upcomingHasMore ?? this.upcomingHasMore,
      completedHasMore: completedHasMore ?? this.completedHasMore,
      cancelledHasMore: cancelledHasMore ?? this.cancelledHasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      isCancelling: isCancelling ?? this.isCancelling,
      isRejectingQuote: isRejectingQuote ?? this.isRejectingQuote,
      isAcceptingQuote: isAcceptingQuote ?? this.isAcceptingQuote,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status,
        currentTab,
        allBookings,
        upcomingBookings,
        completedBookings,
        cancelledBookings,
        allCurrentPage,
        upcomingCurrentPage,
        completedCurrentPage,
        cancelledCurrentPage,
        allHasMore,
        upcomingHasMore,
        completedHasMore,
        cancelledHasMore,
        isLoadingMore,
        hasMore,
        currentPage,
        isRefreshing,
        isCancelling,
        isRejectingQuote,
        isAcceptingQuote,
        errorMessage,
      ];
}
