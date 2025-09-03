import '../../domain/entities/service_response_entity.dart';
import '../../domain/repositories/service_repository.dart';
import '../datasources/service_remote_datasource.dart';

class ServiceRepositoryImpl implements ServiceRepository {
  final ServiceRemoteDataSource remoteDataSource;

  const ServiceRepositoryImpl({required this.remoteDataSource});

  @override
  Future<ServiceResponseEntity> getServices({
    required String city,
    required String state,
    required int categoryId,
    required int subcategoryId,
    int page = 1,
    int limit = 10,
  }) async {
    final serviceResponseModel = await remoteDataSource.getServices(
      city: city,
      state: state,
      categoryId: categoryId,
      subcategoryId: subcategoryId,
      page: page,
      limit: limit,
    );
    return serviceResponseModel.toEntity();
  }
}