import '../../domain/entities/payment_progress_entity.dart';
import 'payment_segment_model.dart';

class PaymentProgressModel extends PaymentProgressEntity {
  const PaymentProgressModel({
    required super.totalAmount,
    required super.paidAmount,
    required super.remainingAmount,
    required super.totalSegments,
    required super.paidSegments,
    required super.remainingSegments,
    required super.progressPercentage,
    required super.segments,
  });

  factory PaymentProgressModel.fromJson(Map<String, dynamic> json) {
    final segmentsList = json['segments'] as List<dynamic>? ?? [];

    return PaymentProgressModel(
      totalAmount: (json['total_amount'] as num).toDouble(),
      paidAmount: (json['paid_amount'] as num).toDouble(),
      remainingAmount: (json['remaining_amount'] as num).toDouble(),
      totalSegments: json['total_segments'] as int,
      paidSegments: json['paid_segments'] as int,
      remainingSegments: json['remaining_segments'] as int,
      progressPercentage: (json['progress_percentage'] as num).toDouble(),
      segments: segmentsList
          .map((segment) => PaymentSegmentModel.fromJson(segment as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total_amount': totalAmount,
      'paid_amount': paidAmount,
      'remaining_amount': remainingAmount,
      'total_segments': totalSegments,
      'paid_segments': paidSegments,
      'remaining_segments': remainingSegments,
      'progress_percentage': progressPercentage,
      'segments': segments
          .map((segment) => PaymentSegmentModel.fromEntity(segment).toJson())
          .toList(),
    };
  }

  PaymentProgressEntity toEntity() {
    return PaymentProgressEntity(
      totalAmount: totalAmount,
      paidAmount: paidAmount,
      remainingAmount: remainingAmount,
      totalSegments: totalSegments,
      paidSegments: paidSegments,
      remainingSegments: remainingSegments,
      progressPercentage: progressPercentage,
      segments: segments.map((segment) => PaymentSegmentModel.fromEntity(segment).toEntity()).toList(),
    );
  }

  factory PaymentProgressModel.fromEntity(PaymentProgressEntity entity) {
    return PaymentProgressModel(
      totalAmount: entity.totalAmount,
      paidAmount: entity.paidAmount,
      remainingAmount: entity.remainingAmount,
      totalSegments: entity.totalSegments,
      paidSegments: entity.paidSegments,
      remainingSegments: entity.remainingSegments,
      progressPercentage: entity.progressPercentage,
      segments: entity.segments.map((segment) => PaymentSegmentModel.fromEntity(segment)).toList(),
    );
  }
}