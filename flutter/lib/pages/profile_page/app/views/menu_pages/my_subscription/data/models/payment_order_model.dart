import '../../domain/entities/payment_order_entity.dart';

class PaymentOrderModel {
  final String keyId;
  final RazorpayOrderModel order;
  final PaymentModel payment;

  const PaymentOrderModel({
    required this.keyId,
    required this.order,
    required this.payment,
  });

  factory PaymentOrderModel.fromJson(Map<String, dynamic> json) {
    return PaymentOrderModel(
      keyId: json['key_id'] ?? '',
      order: RazorpayOrderModel.fromJson(json['order'] ?? {}),
      payment: PaymentModel.fromJson(json['payment'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'key_id': keyId,
      'order': order.toJson(),
      'payment': payment.toJson(),
    };
  }

  PaymentOrderEntity toEntity() {
    return PaymentOrderEntity(
      keyId: keyId,
      order: order.toEntity(),
      payment: payment.toEntity(),
    );
  }
}

class RazorpayOrderModel {
  final int amount;
  final String currency;
  final String id;
  final String keyId;
  final String receipt;

  const RazorpayOrderModel({
    required this.amount,
    required this.currency,
    required this.id,
    required this.keyId,
    required this.receipt,
  });

  factory RazorpayOrderModel.fromJson(Map<String, dynamic> json) {
    return RazorpayOrderModel(
      amount: json['amount'] ?? 0,
      currency: json['currency'] ?? '',
      id: json['id'] ?? '',
      keyId: json['key_id'] ?? '',
      receipt: json['receipt'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'amount': amount,
      'currency': currency,
      'id': id,
      'key_id': keyId,
      'receipt': receipt,
    };
  }

  RazorpayOrderEntity toEntity() {
    return RazorpayOrderEntity(
      amount: amount,
      currency: currency,
      id: id,
      keyId: keyId,
      receipt: receipt,
    );
  }
}

class PaymentModel {
  final int id;
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
  final String initiatedAt;
  final String? completedAt;
  final String? failedAt;
  final String description;
  final String notes;
  final PaymentMetadataModel metadata;
  final String createdAt;
  final String updatedAt;

  const PaymentModel({
    required this.id,
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
    required this.initiatedAt,
    this.completedAt,
    this.failedAt,
    required this.description,
    required this.notes,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['ID'] ?? json['id'] ?? 0,
      paymentReference: json['payment_reference'] ?? '',
      userId: json['user_id'] ?? 0,
      amount: (json['amount'] ?? 0).toDouble(),
      currency: json['currency'] ?? '',
      status: json['status'] ?? '',
      type: json['type'] ?? '',
      method: json['method'] ?? '',
      relatedEntityType: json['related_entity_type'] ?? '',
      relatedEntityId: json['related_entity_id'] ?? 0,
      razorpayOrderId: json['razorpay_order_id'],
      razorpayPaymentId: json['razorpay_payment_id'],
      razorpaySignature: json['razorpay_signature'],
      initiatedAt: json['initiated_at'] ?? '',
      completedAt: json['completed_at'],
      failedAt: json['failed_at'],
      description: json['description'] ?? '',
      notes: json['notes'] ?? '',
      metadata: PaymentMetadataModel.fromJson(json['metadata'] ?? {}),
      createdAt: json['CreatedAt'] ?? json['created_at'] ?? '',
      updatedAt: json['UpdatedAt'] ?? json['updated_at'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ID': id,
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
      'initiated_at': initiatedAt,
      'completed_at': completedAt,
      'failed_at': failedAt,
      'description': description,
      'notes': notes,
      'metadata': metadata.toJson(),
      'CreatedAt': createdAt,
      'UpdatedAt': updatedAt,
    };
  }

  PaymentEntity toEntity() {
    return PaymentEntity(
      id: id,
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
      initiatedAt: DateTime.parse(initiatedAt),
      completedAt: completedAt != null ? DateTime.parse(completedAt!) : null,
      failedAt: failedAt != null ? DateTime.parse(failedAt!) : null,
      description: description,
      notes: notes,
      metadata: metadata.toEntity(),
      createdAt: DateTime.parse(createdAt),
      updatedAt: DateTime.parse(updatedAt),
    );
  }
}

class PaymentMetadataModel {
  final int durationDays;
  final String durationType;

  const PaymentMetadataModel({
    required this.durationDays,
    required this.durationType,
  });

  factory PaymentMetadataModel.fromJson(Map<String, dynamic> json) {
    return PaymentMetadataModel(
      durationDays: json['duration_days'] ?? 0,
      durationType: json['duration_type'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'duration_days': durationDays,
      'duration_type': durationType,
    };
  }

  PaymentMetadataEntity toEntity() {
    return PaymentMetadataEntity(
      durationDays: durationDays,
      durationType: durationType,
    );
  }
}

class SubscriptionPurchaseRequestModel {
  final int planId;
  final String durationType;

  const SubscriptionPurchaseRequestModel({
    required this.planId,
    required this.durationType,
  });

  Map<String, dynamic> toJson() {
    return {
      'plan_id': planId,
      'duration_type': durationType,
    };
  }

  factory SubscriptionPurchaseRequestModel.fromEntity(
    SubscriptionPurchaseRequestEntity entity,
  ) {
    return SubscriptionPurchaseRequestModel(
      planId: entity.planId,
      durationType: entity.durationType,
    );
  }
}

class CompletePurchaseRequestModel {
  final int paymentId;
  final String razorpayPaymentId;
  final String razorpaySignature;

  const CompletePurchaseRequestModel({
    required this.paymentId,
    required this.razorpayPaymentId,
    required this.razorpaySignature,
  });

  Map<String, dynamic> toJson() {
    return {
      'payment_id': paymentId,
      'razorpay_payment_id': razorpayPaymentId,
      'razorpay_signature': razorpaySignature,
    };
  }

  factory CompletePurchaseRequestModel.fromEntity(
    CompletePurchaseRequestEntity entity,
  ) {
    return CompletePurchaseRequestModel(
      paymentId: entity.paymentId,
      razorpayPaymentId: entity.razorpayPaymentId,
      razorpaySignature: entity.razorpaySignature,
    );
  }
}