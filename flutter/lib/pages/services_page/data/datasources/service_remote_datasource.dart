import 'package:dio/dio.dart';
import '../../../../commons/constants/api_endpoints.dart';
import '../../../../commons/utils/error_handler.dart';
import '../../../../commons/utils/services/dio_client.dart';
import '../models/service_response_model.dart';
import '../models/search_suggestions_response_model.dart';
import '../models/popular_services_response_model.dart';
import '../models/search_response_model.dart';

abstract class ServiceRemoteDataSource {
  Future<ServiceResponseModel> getServices({
    required String city,
    required String state,
    int? categoryId,
    int? subcategoryId,
    int page = 1,
    int limit = 10,
  });

  Future<SearchResponseModel> searchServices({
    required String query,
    int page = 1,
    int limit = 20,
  });

  Future<SearchSuggestionsResponseModel> getSearchSuggestions();

  Future<PopularServicesResponseModel> getPopularServices({
    String? city,
    String? state,
  });
}

class ServiceRemoteDataSourceImpl implements ServiceRemoteDataSource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  ServiceRemoteDataSourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<ServiceResponseModel> getServices({
    required String city,
    required String state,
    int? categoryId,
    int? subcategoryId,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final url = ApiEndpoints.services.path;
      var queryParameters = <String, dynamic>{
        'page': page,
        'limit': limit,
        'exclude_inactive': true,
      };

      // Don't filter by location - show all services for the category
      // Only add city and state if they have actual non-empty values
      // (Empty strings would still trigger location filtering in backend)
      // if (city.isNotEmpty) {
      //   queryParameters['city'] = city;
      // }
      // if (state.isNotEmpty) {
      //   queryParameters['state'] = state;
      // }

      if (categoryId != null) {
        queryParameters['category'] = categoryId;
      }

      if (subcategoryId != null) {
        queryParameters['subcategory'] = subcategoryId;
      }

      final response =
          await dioClient.dio.get(url, queryParameters: queryParameters);

      if (response.statusCode == 200) {
        final apiResponse = ServicesApiResponseModel.fromJson(response.data);
        if (apiResponse.success) {
          return apiResponse.data;
        } else {
          throw Exception(apiResponse.message);
        }
      } else {
        throw Exception('Failed to fetch services. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not fetch services. Please try again.');
    }
  }

  @override
  Future<SearchSuggestionsResponseModel> getSearchSuggestions() async {
    try {
      final url = ApiEndpoints.searchSuggestions.path;
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200) {
        final apiResponse =
            SearchSuggestionsResponseModel.fromJson(response.data);
        if (apiResponse.success) {
          return apiResponse;
        } else {
          throw Exception(apiResponse.message);
        }
      } else {
        throw Exception(
            'Failed to fetch search suggestions. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not fetch search suggestions. Please try again.');
    }
  }

  @override
  Future<SearchResponseModel> searchServices({
    required String query,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final url = ApiEndpoints.searchServices.path;
      final response = await dioClient.dio.get(url, queryParameters: {
        'q': query,
        'page': page,
        'limit': limit,
      });

      if (response.statusCode == 200) {
        final apiResponse = SearchResponseModel.fromJson(response.data);
        if (apiResponse.success) {
          return apiResponse;
        } else {
          throw Exception(apiResponse.message);
        }
      } else {
        throw Exception('Failed to search services. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not search services. Please try again.');
    }
  }

  @override
  Future<PopularServicesResponseModel> getPopularServices({
    String? city,
    String? state,
  }) async {
    try {
      final url = ApiEndpoints.popularServices.path;
      var queryParameters = <String, dynamic>{};

      if (city != null) {
        queryParameters['city'] = city;
      }

      if (state != null) {
        queryParameters['state'] = state;
      }

      final response = await dioClient.dio.get(
        url,
        queryParameters: queryParameters.isNotEmpty ? queryParameters : null,
      );

      if (response.statusCode == 200) {
        final apiResponse =
            PopularServicesResponseModel.fromJson(response.data);
        if (apiResponse.success) {
          return apiResponse;
        } else {
          throw Exception(apiResponse.message);
        }
      } else {
        throw Exception('Failed to fetch popular services. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not fetch popular services. Please try again.');
    }
  }
}
