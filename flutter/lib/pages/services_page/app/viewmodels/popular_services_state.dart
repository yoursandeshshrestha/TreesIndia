import 'package:equatable/equatable.dart';
import '../../domain/entities/service_detail_entity.dart';

enum PopularServicesStatus { initial, loading, success, failure }

class PopularServicesState extends Equatable {
  final PopularServicesStatus status;
  final List<ServiceDetailEntity> services;
  final String errorMessage;

  const PopularServicesState({
    this.status = PopularServicesStatus.initial,
    this.services = const [],
    this.errorMessage = '',
  });

  PopularServicesState copyWith({
    PopularServicesStatus? status,
    List<ServiceDetailEntity>? services,
    String? errorMessage,
  }) {
    return PopularServicesState(
      status: status ?? this.status,
      services: services ?? this.services,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object> get props => [status, services, errorMessage];
}
