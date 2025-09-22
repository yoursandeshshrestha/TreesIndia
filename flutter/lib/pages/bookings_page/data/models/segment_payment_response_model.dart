import '../../domain/entities/segment_payment_response_entity.dart';

class SegmentPaymentResponseModel extends SegmentPaymentResponseEntity {
  const SegmentPaymentResponseModel({
    required super.orderId,
    required super.amount,
    required super.currency,
    required super.keyId,
    super.paymentId,
  });

  factory SegmentPaymentResponseModel.fromJson(Map<String, dynamic> json) {
    // Handle nested payment_order structure for Razorpay payments
    final paymentOrder = json['payment_order'] as Map<String, dynamic>?;
    final payment = json['payment'] as Map<String, dynamic>?;

    if (paymentOrder != null) {
      // Razorpay payment structure
      return SegmentPaymentResponseModel(
        orderId: paymentOrder['id'] as String,
        amount: (paymentOrder['amount'] as num).toDouble(),
        currency: paymentOrder['currency'] as String,
        keyId: paymentOrder['key_id'] as String,
        paymentId: payment?['ID'] as int? ?? payment?['id'] as int?,
      );
    }

    // Handle wallet payment structure
    if (payment != null) {
      return SegmentPaymentResponseModel(
        orderId: payment['payment_reference'] as String,
        amount: (payment['amount'] as num).toDouble(),
        currency: payment['currency'] as String,
        keyId: '', // Not applicable for wallet payments
        paymentId: payment['ID'] as int?,
      );
    }

    // Fallback to direct structure
    return SegmentPaymentResponseModel(
      orderId: json['id'] as String? ?? json['order_id'] as String? ?? '',
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'INR',
      keyId: json['key_id'] as String? ?? '',
      paymentId: json['payment_id'] as int?,
    );
  }

  SegmentPaymentResponseEntity toEntity() {
    return SegmentPaymentResponseEntity(
      orderId: orderId,
      amount: amount,
      currency: currency,
      keyId: keyId,
      paymentId: paymentId,
    );
  }
}

class SegmentPaymentVerificationModel extends SegmentPaymentVerificationEntity {
  const SegmentPaymentVerificationModel({
    required super.razorpayPaymentId,
    required super.razorpayOrderId,
    required super.razorpaySignature,
  });

  factory SegmentPaymentVerificationModel.fromEntity(
      SegmentPaymentVerificationEntity entity) {
    return SegmentPaymentVerificationModel(
      razorpayPaymentId: entity.razorpayPaymentId,
      razorpayOrderId: entity.razorpayOrderId,
      razorpaySignature: entity.razorpaySignature,
    );
  }

  SegmentPaymentVerificationEntity toEntity() {
    return SegmentPaymentVerificationEntity(
      razorpayPaymentId: razorpayPaymentId,
      razorpayOrderId: razorpayOrderId,
      razorpaySignature: razorpaySignature,
    );
  }
}

class WalletSegmentPaymentRequestModel extends WalletSegmentPaymentRequestEntity {
  const WalletSegmentPaymentRequestModel({
    required super.segmentNumber,
    required super.amount,
  });

  factory WalletSegmentPaymentRequestModel.fromEntity(
      WalletSegmentPaymentRequestEntity entity) {
    return WalletSegmentPaymentRequestModel(
      segmentNumber: entity.segmentNumber,
      amount: entity.amount,
    );
  }

  WalletSegmentPaymentRequestEntity toEntity() {
    return WalletSegmentPaymentRequestEntity(
      segmentNumber: segmentNumber,
      amount: amount,
    );
  }
}