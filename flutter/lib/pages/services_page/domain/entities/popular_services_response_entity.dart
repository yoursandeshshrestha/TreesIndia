import 'package:equatable/equatable.dart';
import 'service_detail_entity.dart';

class PopularServicesResponseEntity extends Equatable {
  final bool success;
  final String message;
  final List<ServiceDetailEntity> data;
  final DateTime timestamp;

  const PopularServicesResponseEntity({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  @override
  List<Object?> get props => [
        success,
        message,
        data,
        timestamp,
      ];
}
