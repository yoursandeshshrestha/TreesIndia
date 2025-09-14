class QuotePaymentResponseEntity {
  final bool success;
  final String message;
  final QuotePaymentDataEntity data;
  final String timestamp;

  QuotePaymentResponseEntity({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });
}

class QuotePaymentDataEntity {
  final String message;
  final PaymentOrderEntity paymentOrder;

  QuotePaymentDataEntity({
    required this.message,
    required this.paymentOrder,
  });
}

class PaymentOrderEntity {
  final int amount;
  final String currency;
  final String id;
  final String keyId;
  final String receipt;

  PaymentOrderEntity({
    required this.amount,
    required this.currency,
    required this.id,
    required this.keyId,
    required this.receipt,
  });
}