import '../entities/popular_services_response_entity.dart';
import '../repositories/service_repository.dart';

class GetPopularServicesUseCase {
  final ServiceRepository repository;

  const GetPopularServicesUseCase(this.repository);

  Future<PopularServicesResponseEntity> call({
    String? city,
    String? state,
  }) async {
    return await repository.getPopularServices(
      city: city,
      state: state,
    );
  }
}
