import 'package:equatable/equatable.dart';

class PaymentEntity extends Equatable {
  final int id;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;
  final String paymentReference;
  final int userId;
  final double amount;
  final String currency;
  final String status;
  final String type;
  final String method;
  final String relatedEntityType;
  final int relatedEntityId;
  final String? razorpayOrderId;
  final String? razorpayPaymentId;
  final String? razorpaySignature;
  final DateTime? initiatedAt;
  final DateTime? completedAt;
  final DateTime? failedAt;
  final DateTime? refundedAt;
  final double? balanceAfter;
  final double? refundAmount;
  final String? refundReason;
  final String? refundMethod;
  final String description;
  final String notes;
  final Map<String, dynamic> metadata;

  const PaymentEntity({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.paymentReference,
    required this.userId,
    required this.amount,
    required this.currency,
    required this.status,
    required this.type,
    required this.method,
    required this.relatedEntityType,
    required this.relatedEntityId,
    this.razorpayOrderId,
    this.razorpayPaymentId,
    this.razorpaySignature,
    this.initiatedAt,
    this.completedAt,
    this.failedAt,
    this.refundedAt,
    this.balanceAfter,
    this.refundAmount,
    this.refundReason,
    this.refundMethod,
    required this.description,
    required this.notes,
    required this.metadata,
  });

  @override
  List<Object?> get props => [
        id,
        createdAt,
        updatedAt,
        deletedAt,
        paymentReference,
        userId,
        amount,
        currency,
        status,
        type,
        method,
        relatedEntityType,
        relatedEntityId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        initiatedAt,
        completedAt,
        failedAt,
        refundedAt,
        balanceAfter,
        refundAmount,
        refundReason,
        refundMethod,
        description,
        notes,
        metadata,
      ];
}