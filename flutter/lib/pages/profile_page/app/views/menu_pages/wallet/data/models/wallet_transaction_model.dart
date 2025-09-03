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

  const WalletTransactionModel({
    required this.id,
    required this.paymentReference,
    required this.amount,
    required this.status,
    required this.type,
    required this.method,
    required this.createdAt,
    this.completedAt,
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
        other.completedAt == completedAt;
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
        completedAt.hashCode;
  }

  @override
  String toString() {
    return 'WalletTransactionModel(id: $id, paymentReference: $paymentReference, amount: $amount, status: $status, type: $type, method: $method, createdAt: $createdAt, completedAt: $completedAt)';
  }
}