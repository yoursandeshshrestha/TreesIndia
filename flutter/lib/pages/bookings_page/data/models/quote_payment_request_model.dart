import '../../domain/entities/quote_payment_request_entity.dart';

class QuotePaymentRequestModel {
  final String scheduledDate;
  final String scheduledTime;
  final int amount;

  QuotePaymentRequestModel({
    required this.scheduledDate,
    required this.scheduledTime,
    required this.amount,
  });

  Map<String, dynamic> toJson() {
    return {
      'scheduled_date': scheduledDate,
      'scheduled_time': scheduledTime,
      'amount': amount,
    };
  }

  factory QuotePaymentRequestModel.fromEntity(QuotePaymentRequestEntity entity) {
    return QuotePaymentRequestModel(
      scheduledDate: entity.scheduledDate,
      scheduledTime: entity.scheduledTime,
      amount: entity.amount,
    );
  }
}

class QuotePaymentVerificationModel {
  final String razorpayOrderId;
  final String razorpayPaymentId;
  final String razorpaySignature;

  QuotePaymentVerificationModel({
    required this.razorpayOrderId,
    required this.razorpayPaymentId,
    required this.razorpaySignature,
  });

  Map<String, dynamic> toJson() {
    return {
      'razorpay_order_id': razorpayOrderId,
      'razorpay_payment_id': razorpayPaymentId,
      'razorpay_signature': razorpaySignature,
    };
  }

  factory QuotePaymentVerificationModel.fromEntity(QuotePaymentVerificationEntity entity) {
    return QuotePaymentVerificationModel(
      razorpayOrderId: entity.razorpayOrderId,
      razorpayPaymentId: entity.razorpayPaymentId,
      razorpaySignature: entity.razorpaySignature,
    );
  }
}

class WalletQuotePaymentRequestModel {
  final String scheduledDate;
  final String scheduledTime;
  final int amount;

  WalletQuotePaymentRequestModel({
    required this.scheduledDate,
    required this.scheduledTime,
    required this.amount,
  });

  Map<String, dynamic> toJson() {
    return {
      'scheduled_date': scheduledDate,
      'scheduled_time': scheduledTime,
      'amount': amount,
    };
  }

  factory WalletQuotePaymentRequestModel.fromEntity(WalletQuotePaymentRequestEntity entity) {
    return WalletQuotePaymentRequestModel(
      scheduledDate: entity.scheduledDate,
      scheduledTime: entity.scheduledTime,
      amount: entity.amount,
    );
  }
}