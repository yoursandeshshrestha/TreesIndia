import '../../domain/entities/booking_entity.dart';
import 'booking_address_model.dart';

class PaymentOrderModel extends PaymentOrderEntity {
  const PaymentOrderModel({
    required super.amount,
    required super.currency,
    required super.id,
    required super.keyId,
    required super.receipt,
  });

  factory PaymentOrderModel.fromJson(Map<String, dynamic> json) {
    return PaymentOrderModel(
      amount: json['amount'] as int? ?? 0,
      currency: json['currency'] as String? ?? '',
      id: json['id'] as String? ?? '',
      keyId: json['key_id'] as String? ?? '',
      receipt: json['receipt'] as String? ?? '',
    );
  }

  PaymentOrderEntity toEntity() {
    return PaymentOrderEntity(
      amount: amount,
      currency: currency,
      id: id,
      keyId: keyId,
      receipt: receipt,
    );
  }
}

class BookingModel extends BookingEntity {
  const BookingModel({
    required super.id,
    required super.bookingReference,
    required super.userId,
    required super.serviceId,
    required super.status,
    required super.paymentStatus,
    required super.bookingType,
    required super.address,
    required super.description,
    required super.contactPerson,
    required super.contactPhone,
    required super.createdAt,
    required super.updatedAt,
    super.scheduledDate,
    super.scheduledTime,
    super.scheduledEndTime,
    super.specialInstructions,
    super.holdExpiresAt,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['ID'] as int? ?? 0,
      bookingReference: json['booking_reference'] as String? ?? '',
      userId: json['user_id'] as int? ?? 0,
      serviceId: json['service_id'] as int? ?? 0,
      status: json['status'] as String? ?? '',
      paymentStatus: json['payment_status'] as String? ?? '',
      bookingType: json['booking_type'] as String? ?? '',
      address: json['address'] as String? ?? '',
      description: json['description'] as String? ?? '',
      contactPerson: json['contact_person'] as String? ?? '',
      contactPhone: json['contact_phone'] as String? ?? '',
      createdAt: DateTime.tryParse(json['CreatedAt'] as String? ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['UpdatedAt'] as String? ?? '') ?? DateTime.now(),
      scheduledDate: json['scheduled_date'] as String?,
      scheduledTime: json['scheduled_time'] as String?,
      scheduledEndTime: json['scheduled_end_time'] as String?,
      specialInstructions: json['special_instructions'] as String?,
      holdExpiresAt: json['hold_expires_at'] as String?,
    );
  }

  BookingEntity toEntity() {
    return BookingEntity(
      id: id,
      bookingReference: bookingReference,
      userId: userId,
      serviceId: serviceId,
      status: status,
      paymentStatus: paymentStatus,
      bookingType: bookingType,
      address: address,
      description: description,
      contactPerson: contactPerson,
      contactPhone: contactPhone,
      createdAt: createdAt,
      updatedAt: updatedAt,
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      scheduledEndTime: scheduledEndTime,
      specialInstructions: specialInstructions,
      holdExpiresAt: holdExpiresAt,
    );
  }
}

class BookingResponseModel extends BookingResponseEntity {
  const BookingResponseModel({
    required super.booking,
    required super.message,
    super.paymentRequired,
    super.holdExpiresAt,
    super.paymentOrder,
    super.paymentType,
  });

  factory BookingResponseModel.fromJson(Map<String, dynamic> json) {
    return BookingResponseModel(
      booking: BookingModel.fromJson(json['booking'] as Map<String, dynamic>? ?? {}),
      message: json['message'] as String? ?? '',
      paymentRequired: json['payment_required'] as bool?,
      holdExpiresAt: json['hold_expires_at'] as String?,
      paymentOrder: json['payment_order'] != null
          ? PaymentOrderModel.fromJson(
              json['payment_order'] as Map<String, dynamic>)
          : null,
      paymentType: json['payment_type'] as String?,
    );
  }

  BookingResponseEntity toEntity() {
    return BookingResponseEntity(
      booking: (booking as BookingModel).toEntity(),
      message: message,
      paymentRequired: paymentRequired,
      holdExpiresAt: holdExpiresAt,
      paymentOrder: paymentOrder != null
          ? (paymentOrder as PaymentOrderModel).toEntity()
          : null,
      paymentType: paymentType,
    );
  }
}

class CreateBookingRequestModel extends CreateBookingRequestEntity {
  const CreateBookingRequestModel({
    required super.serviceId,
    required super.scheduledDate,
    required super.scheduledTime,
    required super.address,
    required super.description,
    required super.contactPerson,
    required super.contactPhone,
    super.specialInstructions,
  });

  Map<String, dynamic> toJson() {
    return {
      'service_id': serviceId,
      'scheduled_date': scheduledDate,
      'scheduled_time': scheduledTime,
      'address': (address as BookingAddressModel).toJson(),
      'description': description,
      'contact_person': contactPerson,
      'contact_phone': contactPhone,
      if (specialInstructions != null)
        'special_instructions': specialInstructions,
    };
  }

  factory CreateBookingRequestModel.fromEntity(
      CreateBookingRequestEntity entity) {
    return CreateBookingRequestModel(
      serviceId: entity.serviceId,
      scheduledDate: entity.scheduledDate,
      scheduledTime: entity.scheduledTime,
      address: BookingAddressModel.fromEntity(entity.address),
      description: entity.description,
      contactPerson: entity.contactPerson,
      contactPhone: entity.contactPhone,
      specialInstructions: entity.specialInstructions,
    );
  }
}

class CreateInquiryBookingRequestModel
    extends CreateInquiryBookingRequestEntity {
  const CreateInquiryBookingRequestModel({
    required super.serviceId,
    required super.address,
    required super.description,
    required super.contactPerson,
    required super.contactPhone,
    super.specialInstructions,
  });

  Map<String, dynamic> toJson() {
    return {
      'service_id': serviceId,
      'address': (address as BookingAddressModel).toJson(),
      'description': description,
      'contact_person': contactPerson,
      'contact_phone': contactPhone,
      if (specialInstructions != null)
        'special_instructions': specialInstructions,
    };
  }

  factory CreateInquiryBookingRequestModel.fromEntity(
      CreateInquiryBookingRequestEntity entity) {
    return CreateInquiryBookingRequestModel(
      serviceId: entity.serviceId,
      address: BookingAddressModel.fromEntity(entity.address),
      description: entity.description,
      contactPerson: entity.contactPerson,
      contactPhone: entity.contactPhone,
      specialInstructions: entity.specialInstructions,
    );
  }
}

class InquiryBookingResponseModel extends InquiryBookingResponseEntity {
  const InquiryBookingResponseModel({
    super.message,
    super.booking,
    super.paymentOrder,
    super.paymentRequired,
  });

  factory InquiryBookingResponseModel.fromJson(Map<String, dynamic> json) {
    return InquiryBookingResponseModel(
      booking: json['booking'] != null
          ? BookingModel.fromJson(json['booking'] as Map<String, dynamic>)
          : null,
      message: json['message'] as String? ?? '',
      paymentRequired: json['payment_required'] as bool?,
      paymentOrder: json['payment_order'] != null
          ? PaymentOrderModel.fromJson(
              json['payment_order'] as Map<String, dynamic>)
          : null,
    );
  }

  InquiryBookingResponseEntity toEntity() {
    return InquiryBookingResponseEntity(
      booking: booking != null ? (booking as BookingModel).toEntity() : null,
      message: message,
      paymentRequired: paymentRequired,
      paymentOrder: paymentOrder != null
          ? (paymentOrder as PaymentOrderModel).toEntity()
          : null,
    );
  }
}

class VerifyPaymentRequestModel extends VerifyPaymentRequestEntity {
  const VerifyPaymentRequestModel({
    required super.serviceId,
    required super.razorpayPaymentId,
    required super.razorpayOrderId,
    required super.razorpaySignature,
  });

  Map<String, dynamic> toJson() {
    return {
      'service_id': serviceId,
      'razorpay_payment_id': razorpayPaymentId,
      'razorpay_order_id': razorpayOrderId,
      'razorpay_signature': razorpaySignature,
    };
  }

  factory VerifyPaymentRequestModel.fromEntity(
      VerifyPaymentRequestEntity entity) {
    return VerifyPaymentRequestModel(
      serviceId: entity.serviceId,
      razorpayPaymentId: entity.razorpayPaymentId,
      razorpayOrderId: entity.razorpayOrderId,
      razorpaySignature: entity.razorpaySignature,
    );
  }
}
