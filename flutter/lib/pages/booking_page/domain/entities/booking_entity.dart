import 'package:equatable/equatable.dart';
import 'booking_address_entity.dart';

class PaymentOrderEntity extends Equatable {
  final int amount;
  final String currency;
  final String id;
  final String keyId;
  final String receipt;

  const PaymentOrderEntity({
    required this.amount,
    required this.currency,
    required this.id,
    required this.keyId,
    required this.receipt,
  });

  @override
  List<Object?> get props => [amount, currency, id, keyId, receipt];
}

class BookingEntity extends Equatable {
  final int id;
  final String bookingReference;
  final int userId;
  final int serviceId;
  final String status;
  final String paymentStatus;
  final String bookingType;
  final String? scheduledDate;
  final String? scheduledTime;
  final String? scheduledEndTime;
  final String address;
  final String description;
  final String contactPerson;
  final String contactPhone;
  final String? specialInstructions;
  final String? holdExpiresAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const BookingEntity({
    required this.id,
    required this.bookingReference,
    required this.userId,
    required this.serviceId,
    required this.status,
    required this.paymentStatus,
    required this.bookingType,
    required this.address,
    required this.description,
    required this.contactPerson,
    required this.contactPhone,
    required this.createdAt,
    required this.updatedAt,
    this.scheduledDate,
    this.scheduledTime,
    this.scheduledEndTime,
    this.specialInstructions,
    this.holdExpiresAt,
  });

  @override
  List<Object?> get props => [
        id,
        bookingReference,
        userId,
        serviceId,
        status,
        paymentStatus,
        bookingType,
        scheduledDate,
        scheduledTime,
        scheduledEndTime,
        address,
        description,
        contactPerson,
        contactPhone,
        specialInstructions,
        holdExpiresAt,
        createdAt,
        updatedAt,
      ];
}

class BookingResponseEntity extends Equatable {
  final BookingEntity booking;
  final String? holdExpiresAt;
  final String message;
  final PaymentOrderEntity? paymentOrder;
  final bool? paymentRequired;
  final String? paymentType;

  const BookingResponseEntity({
    required this.booking,
    required this.message,
    this.paymentRequired,
    this.holdExpiresAt,
    this.paymentOrder,
    this.paymentType,
  });

  @override
  List<Object?> get props => [
        booking,
        holdExpiresAt,
        message,
        paymentOrder,
        paymentRequired,
        paymentType
      ];
}

class CreateBookingRequestEntity extends Equatable {
  final int serviceId;
  final String scheduledDate;
  final String scheduledTime;
  final BookingAddressEntity address;
  final String? description;
  final String contactPerson;
  final String contactPhone;
  final String? specialInstructions;

  const CreateBookingRequestEntity({
    required this.serviceId,
    required this.scheduledDate,
    required this.scheduledTime,
    required this.address,
    this.description,
    required this.contactPerson,
    required this.contactPhone,
    this.specialInstructions,
  });

  @override
  List<Object?> get props => [
        serviceId,
        scheduledDate,
        scheduledTime,
        address,
        description,
        contactPerson,
        contactPhone,
        specialInstructions,
      ];
}

class CreateInquiryBookingRequestEntity extends Equatable {
  final int serviceId;
  final BookingAddressEntity address;
  final String? description;
  final String contactPerson;
  final String contactPhone;
  final String? specialInstructions;

  const CreateInquiryBookingRequestEntity({
    required this.serviceId,
    required this.address,
    this.description,
    required this.contactPerson,
    required this.contactPhone,
    this.specialInstructions,
  });

  @override
  List<Object?> get props => [
        serviceId,
        address,
        description,
        contactPerson,
        contactPhone,
        specialInstructions,
      ];
}

class InquiryBookingResponseEntity extends Equatable {
  final BookingEntity? booking;
  final String? message;
  final PaymentOrderEntity? paymentOrder;
  final bool? paymentRequired;

  const InquiryBookingResponseEntity({
    this.message,
    this.booking,
    this.paymentOrder,
    this.paymentRequired,
  });

  @override
  List<Object?> get props => [
        booking,
        message,
        paymentOrder,
        paymentRequired,
      ];
}

class VerifyPaymentRequestEntity extends Equatable {
  final int serviceId;
  final String razorpayPaymentId;
  final String razorpayOrderId;
  final String razorpaySignature;

  const VerifyPaymentRequestEntity({
    required this.serviceId,
    required this.razorpayPaymentId,
    required this.razorpayOrderId,
    required this.razorpaySignature,
  });

  @override
  List<Object?> get props =>
      [serviceId, razorpayPaymentId, razorpayOrderId, razorpaySignature];
}
