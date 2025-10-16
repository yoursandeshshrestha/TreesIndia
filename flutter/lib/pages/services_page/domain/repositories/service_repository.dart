import '../entities/service_response_entity.dart';
import '../entities/search_suggestions_response_entity.dart';
import '../entities/popular_services_response_entity.dart';
import '../entities/search_response_entity.dart';

abstract class ServiceRepository {
  Future<ServiceResponseEntity> getServices({
    required String city,
    required String state,
    int? categoryId,
    int? subcategoryId,
    int page = 1,
    int limit = 10,
  });

  Future<SearchResponseEntity> searchServices({
    required String query,
    int page = 1,
    int limit = 20,
  });

  Future<SearchSuggestionsResponseEntity> getSearchSuggestions();

  Future<PopularServicesResponseEntity> getPopularServices();
}
