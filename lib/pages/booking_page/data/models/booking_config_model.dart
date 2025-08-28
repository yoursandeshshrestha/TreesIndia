import '../../domain/entities/booking_config_entity.dart';

class BookingConfigModel extends BookingConfigEntity {
  const BookingConfigModel({
    required super.bookingAdvanceDays,
    required super.bookingBufferTimeMinutes,
    required super.bookingHoldTimeMinutes,
    required super.inquiryBookingFee,
    required super.workingHoursEnd,
    required super.workingHoursStart,
  });

  factory BookingConfigModel.fromJson(Map<String, dynamic> json) {
    return BookingConfigModel(
      bookingAdvanceDays: json['booking_advance_days'] as String,
      bookingBufferTimeMinutes: json['booking_buffer_time_minutes'] as String,
      bookingHoldTimeMinutes: json['booking_hold_time_minutes'] as String,
      inquiryBookingFee: json['inquiry_booking_fee'] as String,
      workingHoursEnd: json['working_hours_end'] as String,
      workingHoursStart: json['working_hours_start'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'booking_advance_days': bookingAdvanceDays,
      'booking_buffer_time_minutes': bookingBufferTimeMinutes,
      'booking_hold_time_minutes': bookingHoldTimeMinutes,
      'inquiry_booking_fee': inquiryBookingFee,
      'working_hours_end': workingHoursEnd,
      'working_hours_start': workingHoursStart,
    };
  }

  BookingConfigEntity toEntity() {
    return BookingConfigEntity(
      bookingAdvanceDays: bookingAdvanceDays,
      bookingBufferTimeMinutes: bookingBufferTimeMinutes,
      bookingHoldTimeMinutes: bookingHoldTimeMinutes,
      inquiryBookingFee: inquiryBookingFee,
      workingHoursEnd: workingHoursEnd,
      workingHoursStart: workingHoursStart,
    );
  }
}