import '../../domain/entities/payment_entity.dart';

class PaymentModel extends PaymentEntity {
  const PaymentModel({
    required super.id,
    required super.createdAt,
    required super.updatedAt,
    super.deletedAt,
    required super.paymentReference,
    required super.userId,
    required super.amount,
    required super.currency,
    required super.status,
    required super.type,
    required super.method,
    required super.relatedEntityType,
    required super.relatedEntityId,
    super.razorpayOrderId,
    super.razorpayPaymentId,
    super.razorpaySignature,
    super.initiatedAt,
    super.completedAt,
    super.failedAt,
    super.refundedAt,
    super.balanceAfter,
    super.refundAmount,
    super.refundReason,
    super.refundMethod,
    required super.description,
    required super.notes,
    required super.metadata,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['ID'] as int,
      createdAt: DateTime.parse(json['CreatedAt'] as String),
      updatedAt: DateTime.parse(json['UpdatedAt'] as String),
      deletedAt: json['DeletedAt'] != null
          ? DateTime.parse(json['DeletedAt'] as String)
          : null,
      paymentReference: json['payment_reference'] as String,
      userId: json['user_id'] as int,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String,
      status: json['status'] as String,
      type: json['type'] as String,
      method: json['method'] as String,
      relatedEntityType: json['related_entity_type'] as String,
      relatedEntityId: json['related_entity_id'] as int,
      razorpayOrderId: json['razorpay_order_id'] as String?,
      razorpayPaymentId: json['razorpay_payment_id'] as String?,
      razorpaySignature: json['razorpay_signature'] as String?,
      initiatedAt: json['initiated_at'] != null
          ? DateTime.parse(json['initiated_at'] as String)
          : null,
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'] as String)
          : null,
      failedAt: json['failed_at'] != null
          ? DateTime.parse(json['failed_at'] as String)
          : null,
      refundedAt: json['refunded_at'] != null
          ? DateTime.parse(json['refunded_at'] as String)
          : null,
      balanceAfter: json['balance_after'] != null
          ? (json['balance_after'] as num).toDouble()
          : null,
      refundAmount: json['refund_amount'] != null
          ? (json['refund_amount'] as num).toDouble()
          : null,
      refundReason: json['refund_reason'] as String?,
      refundMethod: json['refund_method'] as String?,
      description: json['description'] as String,
      notes: json['notes'] as String,
      metadata: json['metadata'] as Map<String, dynamic>? ?? {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ID': id,
      'CreatedAt': createdAt.toIso8601String(),
      'UpdatedAt': updatedAt.toIso8601String(),
      'DeletedAt': deletedAt?.toIso8601String(),
      'payment_reference': paymentReference,
      'user_id': userId,
      'amount': amount,
      'currency': currency,
      'status': status,
      'type': type,
      'method': method,
      'related_entity_type': relatedEntityType,
      'related_entity_id': relatedEntityId,
      'razorpay_order_id': razorpayOrderId,
      'razorpay_payment_id': razorpayPaymentId,
      'razorpay_signature': razorpaySignature,
      'initiated_at': initiatedAt?.toIso8601String(),
      'completed_at': completedAt?.toIso8601String(),
      'failed_at': failedAt?.toIso8601String(),
      'refunded_at': refundedAt?.toIso8601String(),
      'balance_after': balanceAfter,
      'refund_amount': refundAmount,
      'refund_reason': refundReason,
      'refund_method': refundMethod,
      'description': description,
      'notes': notes,
      'metadata': metadata,
    };
  }

  PaymentEntity toEntity() {
    return PaymentEntity(
      id: id,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deletedAt: deletedAt,
      paymentReference: paymentReference,
      userId: userId,
      amount: amount,
      currency: currency,
      status: status,
      type: type,
      method: method,
      relatedEntityType: relatedEntityType,
      relatedEntityId: relatedEntityId,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature,
      initiatedAt: initiatedAt,
      completedAt: completedAt,
      failedAt: failedAt,
      refundedAt: refundedAt,
      balanceAfter: balanceAfter,
      refundAmount: refundAmount,
      refundReason: refundReason,
      refundMethod: refundMethod,
      description: description,
      notes: notes,
      metadata: metadata,
    );
  }

  factory PaymentModel.fromEntity(PaymentEntity entity) {
    return PaymentModel(
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      paymentReference: entity.paymentReference,
      userId: entity.userId,
      amount: entity.amount,
      currency: entity.currency,
      status: entity.status,
      type: entity.type,
      method: entity.method,
      relatedEntityType: entity.relatedEntityType,
      relatedEntityId: entity.relatedEntityId,
      razorpayOrderId: entity.razorpayOrderId,
      razorpayPaymentId: entity.razorpayPaymentId,
      razorpaySignature: entity.razorpaySignature,
      initiatedAt: entity.initiatedAt,
      completedAt: entity.completedAt,
      failedAt: entity.failedAt,
      refundedAt: entity.refundedAt,
      balanceAfter: entity.balanceAfter,
      refundAmount: entity.refundAmount,
      refundReason: entity.refundReason,
      refundMethod: entity.refundMethod,
      description: entity.description,
      notes: entity.notes,
      metadata: entity.metadata,
    );
  }
}