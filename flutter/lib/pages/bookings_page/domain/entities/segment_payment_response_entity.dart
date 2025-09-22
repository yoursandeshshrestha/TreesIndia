import 'package:equatable/equatable.dart';

class SegmentPaymentResponseEntity extends Equatable {
  final String orderId;
  final double amount;
  final String currency;
  final String keyId;
  final int? paymentId;

  const SegmentPaymentResponseEntity({
    required this.orderId,
    required this.amount,
    required this.currency,
    required this.keyId,
    this.paymentId,
  });

  @override
  List<Object?> get props => [
        orderId,
        amount,
        currency,
        keyId,
        paymentId,
      ];
}

class SegmentPaymentVerificationEntity extends Equatable {
  final String razorpayPaymentId;
  final String razorpayOrderId;
  final String razorpaySignature;

  const SegmentPaymentVerificationEntity({
    required this.razorpayPaymentId,
    required this.razorpayOrderId,
    required this.razorpaySignature,
  });

  @override
  List<Object?> get props => [
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
      ];

  Map<String, dynamic> toJson() {
    return {
      'razorpay_payment_id': razorpayPaymentId,
      'razorpay_order_id': razorpayOrderId,
      'razorpay_signature': razorpaySignature,
    };
  }
}

class WalletSegmentPaymentRequestEntity extends Equatable {
  final int segmentNumber;
  final double amount;

  const WalletSegmentPaymentRequestEntity({
    required this.segmentNumber,
    required this.amount,
  });

  @override
  List<Object?> get props => [
        segmentNumber,
        amount,
      ];

  Map<String, dynamic> toJson() {
    return {
      'segment_number': segmentNumber,
      'amount': amount,
      'payment_method': 'wallet',
    };
  }
}