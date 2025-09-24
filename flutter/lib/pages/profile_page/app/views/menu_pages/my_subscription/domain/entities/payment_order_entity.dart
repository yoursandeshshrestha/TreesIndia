import 'package:intl/intl.dart';

class PaymentOrderEntity {
  final String keyId;
  final RazorpayOrderEntity order;
  final PaymentEntity payment;

  const PaymentOrderEntity({
    required this.keyId,
    required this.order,
    required this.payment,
  });
}

class RazorpayOrderEntity {
  final int amount;
  final String currency;
  final String id;
  final String keyId;
  final String receipt;

  const RazorpayOrderEntity({
    required this.amount,
    required this.currency,
    required this.id,
    required this.keyId,
    required this.receipt,
  });

  double get displayAmount {
    return amount / 100.0; // Convert paise to rupees
  }

  String get formattedAmount {
    return '₹${displayAmount.toStringAsFixed(0)}';
  }
}

class PaymentEntity {
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
  final DateTime initiatedAt;
  final DateTime? completedAt;
  final DateTime? failedAt;
  final String description;
  final String notes;
  final PaymentMetadataEntity metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  const PaymentEntity({
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

  String get displayAmount {
    return '₹${amount.toStringAsFixed(0)}';
  }

  String get displayStatus {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  bool get isPending => status.toLowerCase() == 'pending';
  bool get isCompleted => status.toLowerCase() == 'completed';
  bool get isFailed => status.toLowerCase() == 'failed';
  bool get isCancelled => status.toLowerCase() == 'cancelled';

  String get displayInitiatedAt {
    return DateFormat('MMMM d, yyyy').format(initiatedAt);
  }

  String get displayCompletedAt {
    return completedAt != null
        ? DateFormat('MMMM d, yyyy').format(completedAt!)
        : 'N/A';
  }

  String get displayFailedAt {
    return failedAt != null
        ? DateFormat('MMMM d, yyyy').format(failedAt!)
        : 'N/A';
  }

  String get displayCreatedAt {
    return DateFormat('MMMM d, yyyy').format(createdAt);
  }
}

class PaymentMetadataEntity {
  final int durationDays;
  final String durationType;

  const PaymentMetadataEntity({
    required this.durationDays,
    required this.durationType,
  });

  String get displayDuration {
    switch (durationType.toLowerCase()) {
      case 'monthly':
        return 'Monthly ($durationDays days)';
      case 'yearly':
        return 'Yearly ($durationDays days)';
      default:
        return '$durationType ($durationDays days)';
    }
  }
}

class SubscriptionPurchaseRequestEntity {
  final int planId;
  final String durationType;

  const SubscriptionPurchaseRequestEntity({
    required this.planId,
    required this.durationType,
  });
}

class CompletePurchaseRequestEntity {
  final int paymentId;
  final String razorpayPaymentId;
  final String razorpaySignature;

  const CompletePurchaseRequestEntity({
    required this.paymentId,
    required this.razorpayPaymentId,
    required this.razorpaySignature,
  });
}