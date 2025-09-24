import '../../domain/entities/wallet_transaction_entity.dart';

class WalletTransactionModel {
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

  const WalletTransactionModel({
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

  factory WalletTransactionModel.fromJson(Map<String, dynamic> json) {
    return WalletTransactionModel(
      id: json['ID'] as int,
      paymentReference: json['payment_reference'] as String,
      amount: (json['amount'] as num).toDouble(),
      status: json['status'] as String,
      type: json['type'] as String,
      method: json['method'] as String,
      createdAt: DateTime.parse(json['CreatedAt'] as String),
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'] as String)
          : null,
      razorpayOrderId: json['razorpay_order_id'] as String?,
      razorpayPaymentId: json['razorpay_payment_id'] as String?,
      razorpaySignature: json['razorpay_signature'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'payment_reference': paymentReference,
      'amount': amount,
      'status': status,
      'type': type,
      'method': method,
      'created_at': createdAt.toIso8601String(),
      'completed_at': completedAt?.toIso8601String(),
      'razorpay_order_id': razorpayOrderId,
      'razorpay_payment_id': razorpayPaymentId,
      'razorpay_signature': razorpaySignature,
    };
  }

  WalletTransactionEntity toEntity() {
    return WalletTransactionEntity(
      id: id,
      paymentReference: paymentReference,
      amount: amount,
      status: status,
      type: type,
      method: method,
      createdAt: createdAt,
      completedAt: completedAt,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WalletTransactionModel &&
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
    return 'WalletTransactionModel(id: $id, paymentReference: $paymentReference, amount: $amount, status: $status, type: $type, method: $method, createdAt: $createdAt, completedAt: $completedAt, razorpayOrderId: $razorpayOrderId, razorpayPaymentId: $razorpayPaymentId, razorpaySignature: $razorpaySignature)';
  }
}