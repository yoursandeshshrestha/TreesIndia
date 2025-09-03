import 'package:dio/dio.dart';
import '../../../../commons/constants/api_endpoints.dart';
import '../../../../commons/utils/error_handler.dart';
import '../../../../commons/utils/services/dio_client.dart';
import '../models/category_model.dart';
import '../models/category_response_model.dart';

abstract class CategoryRemoteDataSource {
  Future<List<CategoryModel>> getCategories();
}

class CategoryRemoteDataSourceImpl implements CategoryRemoteDataSource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  CategoryRemoteDataSourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<List<CategoryModel>> getCategories() async {
    try {
      final url = ApiEndpoints.categories.path;
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200) {
        final categoryResponse = CategoryResponseModel.fromJson(response.data);
        if (categoryResponse.success) {
          return categoryResponse.data.where((category) => category.isActive).toList();
        } else {
          throw Exception(categoryResponse.message);
        }
      } else {
        throw Exception('Failed to fetch categories. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not fetch categories. Please try again.');
    }
  }
}