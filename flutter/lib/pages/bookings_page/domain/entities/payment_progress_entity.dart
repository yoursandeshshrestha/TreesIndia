import 'package:equatable/equatable.dart';
import 'payment_segment_entity.dart';

class PaymentProgressEntity extends Equatable {
  final double totalAmount;
  final double paidAmount;
  final double remainingAmount;
  final int totalSegments;
  final int paidSegments;
  final int remainingSegments;
  final double progressPercentage;
  final List<PaymentSegmentEntity> segments;

  const PaymentProgressEntity({
    required this.totalAmount,
    required this.paidAmount,
    required this.remainingAmount,
    required this.totalSegments,
    required this.paidSegments,
    required this.remainingSegments,
    required this.progressPercentage,
    required this.segments,
  });

  @override
  List<Object?> get props => [
        totalAmount,
        paidAmount,
        remainingAmount,
        totalSegments,
        paidSegments,
        remainingSegments,
        progressPercentage,
        segments,
      ];

  PaymentProgressEntity copyWith({
    double? totalAmount,
    double? paidAmount,
    double? remainingAmount,
    int? totalSegments,
    int? paidSegments,
    int? remainingSegments,
    double? progressPercentage,
    List<PaymentSegmentEntity>? segments,
  }) {
    return PaymentProgressEntity(
      totalAmount: totalAmount ?? this.totalAmount,
      paidAmount: paidAmount ?? this.paidAmount,
      remainingAmount: remainingAmount ?? this.remainingAmount,
      totalSegments: totalSegments ?? this.totalSegments,
      paidSegments: paidSegments ?? this.paidSegments,
      remainingSegments: remainingSegments ?? this.remainingSegments,
      progressPercentage: progressPercentage ?? this.progressPercentage,
      segments: segments ?? this.segments,
    );
  }
}