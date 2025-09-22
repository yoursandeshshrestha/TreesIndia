import '../../domain/entities/segment_payment_request_entity.dart';

class SegmentPaymentRequestModel extends SegmentPaymentRequestEntity {
  const SegmentPaymentRequestModel({
    required super.segmentNumber,
    required super.amount,
    required super.paymentMethod,
  });

  factory SegmentPaymentRequestModel.fromEntity(
      SegmentPaymentRequestEntity entity) {
    return SegmentPaymentRequestModel(
      segmentNumber: entity.segmentNumber,
      amount: entity.amount,
      paymentMethod: entity.paymentMethod,
    );
  }

  SegmentPaymentRequestEntity toEntity() {
    return SegmentPaymentRequestEntity(
      segmentNumber: segmentNumber,
      amount: amount,
      paymentMethod: paymentMethod,
    );
  }
}