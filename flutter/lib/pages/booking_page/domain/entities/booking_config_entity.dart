import 'package:equatable/equatable.dart';

class BookingConfigEntity extends Equatable {
  final String bookingAdvanceDays;
  final String bookingBufferTimeMinutes;
  final String bookingHoldTimeMinutes;
  final String inquiryBookingFee;
  final String workingHoursEnd;
  final String workingHoursStart;

  const BookingConfigEntity({
    required this.bookingAdvanceDays,
    required this.bookingBufferTimeMinutes,
    required this.bookingHoldTimeMinutes,
    required this.inquiryBookingFee,
    required this.workingHoursEnd,
    required this.workingHoursStart,
  });

  @override
  List<Object?> get props => [
        bookingAdvanceDays,
        bookingBufferTimeMinutes,
        bookingHoldTimeMinutes,
        inquiryBookingFee,
        workingHoursEnd,
        workingHoursStart,
      ];
}