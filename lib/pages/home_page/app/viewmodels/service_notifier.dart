import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/service_entity.dart';
import '../../domain/usecases/get_services_usecase.dart';
import 'service_state.dart';

class ServiceNotifier extends StateNotifier<ServiceState> {
  final GetServicesUseCase getServicesUseCase;

  ServiceNotifier({required this.getServicesUseCase}) : super(const ServiceState());

  Future<void> loadServices() async {
    state = state.copyWith(status: ServiceStatus.loading);
    
    try {
      final services = await getServicesUseCase();
      state = state.copyWith(
        status: ServiceStatus.success,
        services: services,
      );
    } catch (error) {
      state = state.copyWith(
        status: ServiceStatus.failure,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> loadServicesByCategory(ServiceCategory category) async {
    state = state.copyWith(
      status: ServiceStatus.loading,
      selectedCategory: category,
    );
    
    try {
      final services = await getServicesUseCase.getByCategory(category);
      state = state.copyWith(
        status: ServiceStatus.success,
        services: services,
      );
    } catch (error) {
      state = state.copyWith(
        status: ServiceStatus.failure,
        errorMessage: error.toString(),
      );
    }
  }

  void setSelectedCategory(ServiceCategory category) {
    if (state.selectedCategory != category) {
      loadServicesByCategory(category);
    }
  }

  List<ServiceEntity> get filteredServices {
    return state.services
        .where((service) => service.category == state.selectedCategory)
        .toList();
  }
}