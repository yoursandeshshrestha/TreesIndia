import 'package:dio/dio.dart';
import '../../../../commons/constants/api_endpoints.dart';
import '../../../../commons/utils/error_handler.dart';
import '../../../../commons/utils/services/dio_client.dart';
import '../models/service_response_model.dart';

abstract class ServiceRemoteDataSource {
  Future<ServiceResponseModel> getServices({
    required String city,
    required String state,
    required int categoryId,
    required int subcategoryId,
    int page = 1,
    int limit = 10,
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
    required int categoryId,
    required int subcategoryId,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final url = ApiEndpoints.services.path;
      final response = await dioClient.dio.get(url, queryParameters: {
        'city': city,
        'state': state,
        'category': categoryId,
        'subcategory': subcategoryId,
        'page': page,
        'limit': limit,
      });

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
}