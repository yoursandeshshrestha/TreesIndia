import 'package:equatable/equatable.dart';

class PaymentSegmentEntity extends Equatable {
  final int id;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;
  final int bookingId;
  final int segmentNumber;
  final double amount;
  final DateTime? dueDate;
  final String status;
  final int? paymentId;
  final DateTime? paidAt;
  final String notes;
  final bool isOverdue;
  final int? daysUntilDue;

  const PaymentSegmentEntity({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.bookingId,
    required this.segmentNumber,
    required this.amount,
    this.dueDate,
    required this.status,
    this.paymentId,
    this.paidAt,
    required this.notes,
    required this.isOverdue,
    this.daysUntilDue,
  });

  @override
  List<Object?> get props => [
        id,
        createdAt,
        updatedAt,
        deletedAt,
        bookingId,
        segmentNumber,
        amount,
        dueDate,
        status,
        paymentId,
        paidAt,
        notes,
        isOverdue,
        daysUntilDue,
      ];

  PaymentSegmentEntity copyWith({
    int? id,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? deletedAt,
    int? bookingId,
    int? segmentNumber,
    double? amount,
    DateTime? dueDate,
    String? status,
    int? paymentId,
    DateTime? paidAt,
    String? notes,
    bool? isOverdue,
    int? daysUntilDue,
  }) {
    return PaymentSegmentEntity(
      id: id ?? this.id,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      deletedAt: deletedAt ?? this.deletedAt,
      bookingId: bookingId ?? this.bookingId,
      segmentNumber: segmentNumber ?? this.segmentNumber,
      amount: amount ?? this.amount,
      dueDate: dueDate ?? this.dueDate,
      status: status ?? this.status,
      paymentId: paymentId ?? this.paymentId,
      paidAt: paidAt ?? this.paidAt,
      notes: notes ?? this.notes,
      isOverdue: isOverdue ?? this.isOverdue,
      daysUntilDue: daysUntilDue ?? this.daysUntilDue,
    );
  }
}