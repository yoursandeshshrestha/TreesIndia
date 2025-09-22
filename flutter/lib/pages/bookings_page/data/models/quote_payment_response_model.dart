import '../../domain/entities/quote_payment_response_entity.dart';

class QuotePaymentResponseModel {
  final bool success;
  final String message;
  final QuotePaymentDataModel data;
  final String timestamp;

  QuotePaymentResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory QuotePaymentResponseModel.fromJson(Map<String, dynamic> json) {
    return QuotePaymentResponseModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: QuotePaymentDataModel.fromJson(json['data'] ?? {}),
      timestamp: json['timestamp'] ?? '',
    );
  }

  QuotePaymentResponseEntity toEntity() {
    return QuotePaymentResponseEntity(
      success: success,
      message: message,
      data: data.toEntity(),
      timestamp: timestamp,
    );
  }
}

class QuotePaymentDataModel {
  final String message;
  final PaymentOrderModel paymentOrder;

  QuotePaymentDataModel({
    required this.message,
    required this.paymentOrder,
  });

  factory QuotePaymentDataModel.fromJson(Map<String, dynamic> json) {
    return QuotePaymentDataModel(
      message: json['message'] ?? '',
      paymentOrder: PaymentOrderModel.fromJson(json['payment_order']['payment_order'] ?? {}),
    );
  }

  QuotePaymentDataEntity toEntity() {
    return QuotePaymentDataEntity(
      message: message,
      paymentOrder: paymentOrder.toEntity(),
    );
  }
}

class PaymentOrderModel {
  final int amount;
  final String currency;
  final String id;
  final String keyId;
  final String receipt;

  PaymentOrderModel({
    required this.amount,
    required this.currency,
    required this.id,
    required this.keyId,
    required this.receipt,
  });

  factory PaymentOrderModel.fromJson(Map<String, dynamic> json) {
    return PaymentOrderModel(
      amount: json['amount'] ?? 0,
      currency: json['currency'] ?? 'INR',
      id: json['id'] ?? '',
      keyId: json['key_id'] ?? '',
      receipt: json['receipt'] ?? '',
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