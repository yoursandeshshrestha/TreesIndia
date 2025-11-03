import '../entities/service_response_entity.dart';
import '../repositories/service_repository.dart';

class GetServicesUseCase {
  final ServiceRepository repository;

  const GetServicesUseCase(this.repository);

  Future<ServiceResponseEntity> call({
    required String city,
    required String state,
    int? categoryId,
    int? subcategoryId,
    int page = 1,
    int limit = 10,
  }) async {
    return await repository.getServices(
      city: city,
      state: state,
      categoryId: categoryId,
      subcategoryId: subcategoryId,
      page: page,
      limit: limit,
    );
  }
}
