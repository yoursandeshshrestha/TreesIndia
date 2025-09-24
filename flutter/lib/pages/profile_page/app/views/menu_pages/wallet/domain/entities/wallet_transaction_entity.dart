class WalletTransactionEntity {
  final int id;
  final String paymentReference;
  final double amount;
  final String status;
  final String type;
  final String method;
  final DateTime createdAt;
  final DateTime? completedAt;
  final String? razorpayOrderId;
  final String? razorpayPaymentId;
  final String? razorpaySignature;

  const WalletTransactionEntity({
    required this.id,
    required this.paymentReference,
    required this.amount,
    required this.status,
    required this.type,
    required this.method,
    required this.createdAt,
    this.completedAt,
    this.razorpayOrderId,
    this.razorpayPaymentId,
    this.razorpaySignature,
  });

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WalletTransactionEntity &&
        other.id == id &&
        other.paymentReference == paymentReference &&
        other.amount == amount &&
        other.status == status &&
        other.type == type &&
        other.method == method &&
        other.createdAt == createdAt &&
        other.completedAt == completedAt &&
        other.razorpayOrderId == razorpayOrderId &&
        other.razorpayPaymentId == razorpayPaymentId &&
        other.razorpaySignature == razorpaySignature;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        paymentReference.hashCode ^
        amount.hashCode ^
        status.hashCode ^
        type.hashCode ^
        method.hashCode ^
        createdAt.hashCode ^
        completedAt.hashCode ^
        razorpayOrderId.hashCode ^
        razorpayPaymentId.hashCode ^
        razorpaySignature.hashCode;
  }

  @override
  String toString() {
    return 'WalletTransactionEntity(id: $id, paymentReference: $paymentReference, amount: $amount, status: $status, type: $type, method: $method, createdAt: $createdAt, completedAt: $completedAt, razorpayOrderId: $razorpayOrderId, razorpayPaymentId: $razorpayPaymentId, razorpaySignature: $razorpaySignature)';
  }

  bool get canCompletePayment {
    return status.toLowerCase() == 'pending' &&
           type.toLowerCase().contains('recharge') &&
           razorpayOrderId != null &&
           razorpayOrderId!.isNotEmpty;
  }
}