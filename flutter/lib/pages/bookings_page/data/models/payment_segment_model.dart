import '../../domain/entities/payment_segment_entity.dart';

class PaymentSegmentModel extends PaymentSegmentEntity {
  const PaymentSegmentModel({
    required super.id,
    required super.createdAt,
    required super.updatedAt,
    super.deletedAt,
    required super.bookingId,
    required super.segmentNumber,
    required super.amount,
    super.dueDate,
    required super.status,
    super.paymentId,
    super.paidAt,
    required super.notes,
    required super.isOverdue,
    super.daysUntilDue,
  });

  factory PaymentSegmentModel.fromJson(Map<String, dynamic> json) {
    return PaymentSegmentModel(
      id: json['ID'] as int? ?? json['id'] as int,
      createdAt: json['CreatedAt'] != null
          ? DateTime.parse(json['CreatedAt'] as String)
          : DateTime.now(), // Fallback for segments without CreatedAt
      updatedAt: json['UpdatedAt'] != null
          ? DateTime.parse(json['UpdatedAt'] as String)
          : DateTime.now(), // Fallback for segments without UpdatedAt
      deletedAt: json['DeletedAt'] != null
          ? DateTime.parse(json['DeletedAt'] as String)
          : null,
      bookingId: json['booking_id'] as int? ?? 0, // Handle missing booking_id
      segmentNumber: json['segment_number'] as int,
      amount: (json['amount'] as num).toDouble(),
      dueDate: json['due_date'] != null
          ? DateTime.parse(json['due_date'] as String)
          : null,
      status: json['status'] as String,
      paymentId: json['payment_id'] as int?,
      paidAt: json['paid_at'] != null
          ? DateTime.parse(json['paid_at'] as String)
          : null,
      notes: json['notes'] as String? ?? '',
      isOverdue: json['is_overdue'] as bool? ?? false,
      daysUntilDue: json['days_until_due'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ID': id,
      'CreatedAt': createdAt.toIso8601String(),
      'UpdatedAt': updatedAt.toIso8601String(),
      'DeletedAt': deletedAt?.toIso8601String(),
      'booking_id': bookingId,
      'segment_number': segmentNumber,
      'amount': amount,
      'due_date': dueDate?.toIso8601String(),
      'status': status,
      'payment_id': paymentId,
      'paid_at': paidAt?.toIso8601String(),
      'notes': notes,
      'is_overdue': isOverdue,
      'days_until_due': daysUntilDue,
    };
  }

  PaymentSegmentEntity toEntity() {
    return PaymentSegmentEntity(
      id: id,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deletedAt: deletedAt,
      bookingId: bookingId,
      segmentNumber: segmentNumber,
      amount: amount,
      dueDate: dueDate,
      status: status,
      paymentId: paymentId,
      paidAt: paidAt,
      notes: notes,
      isOverdue: isOverdue,
      daysUntilDue: daysUntilDue,
    );
  }

  factory PaymentSegmentModel.fromEntity(PaymentSegmentEntity entity) {
    return PaymentSegmentModel(
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      bookingId: entity.bookingId,
      segmentNumber: entity.segmentNumber,
      amount: entity.amount,
      dueDate: entity.dueDate,
      status: entity.status,
      paymentId: entity.paymentId,
      paidAt: entity.paidAt,
      notes: entity.notes,
      isOverdue: entity.isOverdue,
      daysUntilDue: entity.daysUntilDue,
    );
  }
}