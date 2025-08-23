import '../entities/service_entity.dart';
import '../repositories/service_repository.dart';

class GetServicesUseCase {
  final ServiceRepository repository;

  const GetServicesUseCase(this.repository);

  Future<List<ServiceEntity>> call() async {
    return await repository.getServices();
  }

  Future<List<ServiceEntity>> getByCategory(ServiceCategory category) async {
    return await repository.getServicesByCategory(category);
  }

  Future<ServiceEntity?> getById(String id) async {
    return await repository.getServiceById(id);
  }
}