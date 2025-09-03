import 'package:equatable/equatable.dart';
import '../../domain/entities/booking_config_entity.dart';
import '../../domain/entities/available_slot_entity.dart';
import '../../domain/entities/booking_entity.dart';

enum BookingStatus { initial, loading, success, failure }

class BookingState extends Equatable {
  final BookingStatus status;
  final BookingConfigEntity? bookingConfig;
  final AvailableSlotsResponseEntity? availableSlots;
  final BookingResponseEntity? bookingResponse;
  final InquiryBookingResponseEntity? inquiryBookingResponse;
  final String? errorMessage;
  final bool isLoading;
  final String? selectedDate;
  final String? selectedTime;

  const BookingState({
    this.status = BookingStatus.initial,
    this.bookingConfig,
    this.availableSlots,
    this.bookingResponse,
    this.inquiryBookingResponse,
    this.errorMessage,
    this.isLoading = false,
    this.selectedDate,
    this.selectedTime,
  });

  BookingState copyWith({
    BookingStatus? status,
    BookingConfigEntity? bookingConfig,
    AvailableSlotsResponseEntity? availableSlots,
    BookingResponseEntity? bookingResponse,
    InquiryBookingResponseEntity? inquiryBookingResponse,
    String? errorMessage,
    bool? isLoading,
    String? selectedDate,
    String? selectedTime,
  }) {
    return BookingState(
      status: status ?? this.status,
      bookingConfig: bookingConfig ?? this.bookingConfig,
      availableSlots: availableSlots ?? this.availableSlots,
      bookingResponse: bookingResponse ?? this.bookingResponse,
      inquiryBookingResponse: inquiryBookingResponse ?? this.inquiryBookingResponse,
      errorMessage: errorMessage ?? this.errorMessage,
      isLoading: isLoading ?? this.isLoading,
      selectedDate: selectedDate ?? this.selectedDate,
      selectedTime: selectedTime ?? this.selectedTime,
    );
  }

  @override
  List<Object?> get props => [
        status,
        bookingConfig,
        availableSlots,
        bookingResponse,
        inquiryBookingResponse,
        errorMessage,
        isLoading,
        selectedDate,
        selectedTime,
      ];
}