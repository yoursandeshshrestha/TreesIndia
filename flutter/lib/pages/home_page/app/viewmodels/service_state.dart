import 'package:equatable/equatable.dart';
import '../../domain/entities/service_entity.dart';

enum ServiceStatus { initial, loading, success, failure }

class ServiceState extends Equatable {
  final ServiceStatus status;
  final List<ServiceEntity> services;
  final ServiceCategory selectedCategory;
  final String errorMessage;

  const ServiceState({
    this.status = ServiceStatus.initial,
    this.services = const [],
    this.selectedCategory = ServiceCategory.homeServices,
    this.errorMessage = '',
  });

  ServiceState copyWith({
    ServiceStatus? status,
    List<ServiceEntity>? services,
    ServiceCategory? selectedCategory,
    String? errorMessage,
  }) {
    return ServiceState(
      status: status ?? this.status,
      services: services ?? this.services,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object> get props => [status, services, selectedCategory, errorMessage];
}