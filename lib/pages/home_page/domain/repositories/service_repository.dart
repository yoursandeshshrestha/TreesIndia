import '../entities/service_entity.dart';

abstract class ServiceRepository {
  Future<List<ServiceEntity>> getServices();
  Future<List<ServiceEntity>> getServicesByCategory(ServiceCategory category);
  Future<ServiceEntity?> getServiceById(String id);
}