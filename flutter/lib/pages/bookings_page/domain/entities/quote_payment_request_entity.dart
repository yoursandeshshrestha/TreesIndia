class QuotePaymentRequestEntity {
  final String scheduledDate;
  final String scheduledTime;
  final int amount;

  QuotePaymentRequestEntity({
    required this.scheduledDate,
    required this.scheduledTime,
    required this.amount,
  });
}

class QuotePaymentVerificationEntity {
  final String razorpayOrderId;
  final String razorpayPaymentId;
  final String razorpaySignature;

  QuotePaymentVerificationEntity({
    required this.razorpayOrderId,
    required this.razorpayPaymentId,
    required this.razorpaySignature,
  });
}

class WalletQuotePaymentRequestEntity {
  final String scheduledDate;
  final String scheduledTime;
  final int amount;

  WalletQuotePaymentRequestEntity({
    required this.scheduledDate,
    required this.scheduledTime,
    required this.amount,
  });
}