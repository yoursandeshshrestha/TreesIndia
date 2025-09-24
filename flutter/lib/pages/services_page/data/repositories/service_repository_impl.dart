import '../../domain/entities/service_response_entity.dart';
import '../../domain/entities/search_suggestions_response_entity.dart';
import '../../domain/entities/popular_services_response_entity.dart';
import '../../domain/entities/search_response_entity.dart';
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

  @override
  Future<SearchResponseEntity> searchServices({
    required String query,
    int page = 1,
    int limit = 20,
  }) async {
    final responseModel = await remoteDataSource.searchServices(
      query: query,
      page: page,
      limit: limit,
    );
    return responseModel.toEntity();
  }

  @override
  Future<SearchSuggestionsResponseEntity> getSearchSuggestions() async {
    final responseModel = await remoteDataSource.getSearchSuggestions();
    return responseModel.toEntity();
  }

  @override
  Future<PopularServicesResponseEntity> getPopularServices() async {
    final responseModel = await remoteDataSource.getPopularServices();
    return responseModel.toEntity();
  }
}
