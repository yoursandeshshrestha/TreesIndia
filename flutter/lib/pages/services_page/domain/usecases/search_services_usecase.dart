import '../entities/search_response_entity.dart';
import '../repositories/service_repository.dart';

class SearchServicesUseCase {
  final ServiceRepository repository;

  const SearchServicesUseCase({required this.repository});

  Future<SearchResponseEntity> call({
    required String query,
    int page = 1,
    int limit = 20,
  }) async {
    return await repository.searchServices(
      query: query,
      page: page,
      limit: limit,
    );
  }
}