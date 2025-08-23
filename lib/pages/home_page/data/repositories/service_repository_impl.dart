import '../../domain/entities/service_entity.dart';
import '../../domain/repositories/service_repository.dart';
import '../datasources/service_remote_datasource.dart';

class ServiceRepositoryImpl implements ServiceRepository {
  final ServiceRemoteDataSource remoteDataSource;

  const ServiceRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<ServiceEntity>> getServices() async {
    final serviceModels = await remoteDataSource.getServices();
    return serviceModels.map((model) => model.toEntity()).toList();
  }

  @override
  Future<List<ServiceEntity>> getServicesByCategory(ServiceCategory category) async {
    final serviceModels = await remoteDataSource.getServicesByCategory(category);
    return serviceModels.map((model) => model.toEntity()).toList();
  }

  @override
  Future<ServiceEntity?> getServiceById(String id) async {
    final serviceModel = await remoteDataSource.getServiceById(id);
    return serviceModel?.toEntity();
  }
}