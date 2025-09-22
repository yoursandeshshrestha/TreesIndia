import 'package:equatable/equatable.dart';

class SegmentPaymentRequestEntity extends Equatable {
  final int segmentNumber;
  final double amount;
  final String paymentMethod;

  const SegmentPaymentRequestEntity({
    required this.segmentNumber,
    required this.amount,
    required this.paymentMethod,
  });

  @override
  List<Object?> get props => [
        segmentNumber,
        amount,
        paymentMethod,
      ];

  Map<String, dynamic> toJson() {
    return {
      'segment_number': segmentNumber,
      'amount': amount,
      'payment_method': paymentMethod,
    };
  }
}