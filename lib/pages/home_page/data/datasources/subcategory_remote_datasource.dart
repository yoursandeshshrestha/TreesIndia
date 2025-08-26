import 'package:dio/dio.dart';
import '../../../../commons/constants/api_endpoints.dart';
import '../../../../commons/utils/error_handler.dart';
import '../../../../commons/utils/services/dio_client.dart';
import '../models/subcategory_model.dart';
import '../models/subcategory_response_model.dart';

abstract class SubcategoryRemoteDataSource {
  Future<List<SubcategoryModel>> getSubcategoriesByCategory(int categoryId);
}

class SubcategoryRemoteDataSourceImpl implements SubcategoryRemoteDataSource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  SubcategoryRemoteDataSourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<List<SubcategoryModel>> getSubcategoriesByCategory(int categoryId) async {
    try {
      final url = ApiEndpoints.subcategories.path.replaceAll('{categoryId}', categoryId.toString());
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200) {
        final subcategoryResponse = SubcategoryResponseModel.fromJson(response.data);
        if (subcategoryResponse.success) {
          return subcategoryResponse.data.where((subcategory) => subcategory.isActive).toList();
        } else {
          throw Exception(subcategoryResponse.message);
        }
      } else {
        throw Exception('Failed to fetch subcategories. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Could not fetch subcategories. Please try again.');
    }
  }
}