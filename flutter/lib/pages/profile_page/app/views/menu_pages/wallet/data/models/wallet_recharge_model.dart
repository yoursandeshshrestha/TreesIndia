import 'package:flutter/foundation.dart';

import '../../domain/entities/wallet_recharge_entity.dart';

class WalletRechargeModel {
  final double amount;
  final String paymentMethod;
  final String? referenceId;

  const WalletRechargeModel({
    required this.amount,
    required this.paymentMethod,
    this.referenceId,
  });

  factory WalletRechargeModel.fromEntity(WalletRechargeEntity entity) {
    return WalletRechargeModel(
      amount: entity.amount,
      paymentMethod: entity.paymentMethod,
      referenceId: entity.referenceId,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'amount': amount,
      'payment_method': paymentMethod,
      if (referenceId != null) 'reference_id': referenceId,
    };
  }

  WalletRechargeEntity toEntity() {
    return WalletRechargeEntity(
      amount: amount,
      paymentMethod: paymentMethod,
      referenceId: referenceId,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WalletRechargeModel &&
        other.amount == amount &&
        other.paymentMethod == paymentMethod &&
        other.referenceId == referenceId;
  }

  @override
  int get hashCode {
    return amount.hashCode ^ paymentMethod.hashCode ^ referenceId.hashCode;
  }

  @override
  String toString() {
    return 'WalletRechargeModel(amount: $amount, paymentMethod: $paymentMethod, referenceId: $referenceId)';
  }
}

class WalletRechargeResponseModel {
  final PaymentModel payment;
  final PaymentOrderModel paymentOrder;

  const WalletRechargeResponseModel({
    required this.payment,
    required this.paymentOrder,
  });

  factory WalletRechargeResponseModel.fromJson(Map<String, dynamic> json) {
    if (kDebugMode) {
      print('📍 WalletRechargeResponseModel.fromJson started');
      print('📍 json keys: ${json.keys}');
      print('📍 json[\'payment\']: ${json['payment']}');
      print('📍 json[\'payment_order\']: ${json['payment_order']}');
    }

    try {
      if (kDebugMode) print('📍 About to create PaymentModel');
      final payment =
          PaymentModel.fromJson(json['payment'] as Map<String, dynamic>);
      if (kDebugMode) {
        print('📍 PaymentModel created successfully');

        print('📍 About to create PaymentOrderModel');
      }
      final paymentOrder = PaymentOrderModel.fromJson(
          json['payment_order'] as Map<String, dynamic>);
      if (kDebugMode) print('📍 PaymentOrderModel created successfully');

      return WalletRechargeResponseModel(
        payment: payment,
        paymentOrder: paymentOrder,
      );
    } catch (e) {
      if (kDebugMode) {
        print('📍 Error in WalletRechargeResponseModel.fromJson: $e');
      }
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'payment': payment.toJson(),
      'payment_order': paymentOrder.toJson(),
    };
  }

  WalletRechargeResponseEntity toEntity() {
    return WalletRechargeResponseEntity(
      payment: payment.toEntity(),
      paymentOrder: paymentOrder.toEntity(),
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WalletRechargeResponseModel &&
        other.payment == payment &&
        other.paymentOrder == paymentOrder;
  }

  @override
  int get hashCode => payment.hashCode ^ paymentOrder.hashCode;

  @override
  String toString() {
    return 'WalletRechargeResponseModel(payment: $payment, paymentOrder: $paymentOrder)';
  }
}

class PaymentModel {
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
  final String razorpayOrderId;
  final String? razorpayPaymentId;
  final String? razorpaySignature;
  final DateTime initiatedAt;
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

  const PaymentModel({
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
    required this.razorpayOrderId,
    this.razorpayPaymentId,
    this.razorpaySignature,
    required this.initiatedAt,
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

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    if (kDebugMode) {
      print('📍 PaymentModel.fromJson started');
      print('📍 Payment json keys: ${json.keys}');
      print('📍 Payment json: $json');
    }

    try {
      if (kDebugMode) print('📍 Parsing ID: ${json['ID']}');
      final id = json['ID'] as int;

      if (kDebugMode) print('📍 Parsing CreatedAt: ${json['CreatedAt']}');
      final createdAt = DateTime.parse(json['CreatedAt'] as String);

      if (kDebugMode) print('📍 Parsing UpdatedAt: ${json['UpdatedAt']}');
      final updatedAt = DateTime.parse(json['UpdatedAt'] as String);

      if (kDebugMode) print('📍 Parsing other fields...');
      return PaymentModel(
        id: id,
        createdAt: createdAt,
        updatedAt: updatedAt,
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
        razorpayOrderId: json['razorpay_order_id'] as String,
        razorpayPaymentId: json['razorpay_payment_id'] as String?,
        razorpaySignature: json['razorpay_signature'] as String?,
        initiatedAt: DateTime.parse(json['initiated_at'] as String),
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
        metadata: json['metadata'] as Map<String, dynamic>,
      );
    } catch (e) {
      if (kDebugMode) print('📍 Error in PaymentModel.fromJson: $e');
      rethrow;
    }
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
      'initiated_at': initiatedAt.toIso8601String(),
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
      paymentReference: paymentReference,
      userId: userId,
      amount: amount,
      status: status,
      type: type,
      method: method,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is PaymentModel &&
        other.id == id &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt &&
        other.deletedAt == deletedAt &&
        other.paymentReference == paymentReference &&
        other.userId == userId &&
        other.amount == amount &&
        other.currency == currency &&
        other.status == status &&
        other.type == type &&
        other.method == method &&
        other.relatedEntityType == relatedEntityType &&
        other.relatedEntityId == relatedEntityId &&
        other.razorpayOrderId == razorpayOrderId &&
        other.razorpayPaymentId == razorpayPaymentId &&
        other.razorpaySignature == razorpaySignature &&
        other.initiatedAt == initiatedAt &&
        other.completedAt == completedAt &&
        other.failedAt == failedAt &&
        other.refundedAt == refundedAt &&
        other.balanceAfter == balanceAfter &&
        other.refundAmount == refundAmount &&
        other.refundReason == refundReason &&
        other.refundMethod == refundMethod &&
        other.description == description &&
        other.notes == notes &&
        other.metadata == metadata;
  }

  @override
  int get hashCode {
    return Object.hashAll([
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
    ]);
  }

  @override
  String toString() {
    return 'PaymentModel(id: $id, createdAt: $createdAt, updatedAt: $updatedAt, deletedAt: $deletedAt, paymentReference: $paymentReference, userId: $userId, amount: $amount, currency: $currency, status: $status, type: $type, method: $method, relatedEntityType: $relatedEntityType, relatedEntityId: $relatedEntityId, razorpayOrderId: $razorpayOrderId, razorpayPaymentId: $razorpayPaymentId, razorpaySignature: $razorpaySignature, initiatedAt: $initiatedAt, completedAt: $completedAt, failedAt: $failedAt, refundedAt: $refundedAt, balanceAfter: $balanceAfter, refundAmount: $refundAmount, refundReason: $refundReason, refundMethod: $refundMethod, description: $description, notes: $notes, metadata: $metadata)';
  }
}

class PaymentOrderModel {
  final String id;
  final int amount;
  final String currency;
  final String keyId;
  final String receipt;

  const PaymentOrderModel({
    required this.id,
    required this.amount,
    required this.currency,
    required this.keyId,
    required this.receipt,
  });

  factory PaymentOrderModel.fromJson(Map<String, dynamic> json) {
    if (kDebugMode) {
      print('📍 PaymentOrderModel.fromJson started');
      print('📍 PaymentOrder json keys: ${json.keys}');
      print('📍 PaymentOrder json: $json');
    }

    try {
      return PaymentOrderModel(
        id: json['id'] as String,
        amount: json['amount'] as int,
        currency: json['currency'] as String,
        keyId: json['key_id'] as String,
        receipt: json['receipt'] as String,
      );
    } catch (e) {
      if (kDebugMode) print('📍 Error in PaymentOrderModel.fromJson: $e');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'amount': amount,
      'currency': currency,
      'key_id': keyId,
      'receipt': receipt,
    };
  }

  PaymentOrderEntity toEntity() {
    return PaymentOrderEntity(
      id: id,
      amount: amount,
      currency: currency,
      keyId: keyId,
      receipt: receipt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is PaymentOrderModel &&
        other.id == id &&
        other.amount == amount &&
        other.currency == currency &&
        other.keyId == keyId &&
        other.receipt == receipt;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        amount.hashCode ^
        currency.hashCode ^
        keyId.hashCode ^
        receipt.hashCode;
  }

  @override
  String toString() {
    return 'PaymentOrderModel(id: $id, amount: $amount, currency: $currency, keyId: $keyId, receipt: $receipt)';
  }
}
