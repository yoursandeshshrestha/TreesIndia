import 'package:dio/dio.dart';
import '../../../../../../../../commons/constants/api_endpoints.dart';
import '../../../../../../../../commons/utils/error_handler.dart';
import '../../../../../../../../commons/utils/services/dio_client.dart';
import '../models/property_model.dart';
import '../models/property_form_model.dart';

abstract class PropertyRemoteDataSource {
  Future<PropertiesResponseModel> getUserProperties({
    int page = 1,
    int limit = 20,
  });

  Future<PropertyModel> createProperty(PropertyFormModel propertyForm);

  Future<void> deleteProperty(int propertyId);
}

class PropertyRemoteDataSourceImpl implements PropertyRemoteDataSource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  PropertyRemoteDataSourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<PropertiesResponseModel> getUserProperties({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final url = ApiEndpoints.getUserProperties.path;
      final response = await dioClient.dio.get(
        url,
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      if (response.statusCode == 200) {
        return PropertiesResponseModel.fromJson(response.data);
      } else {
        throw Exception(
            response.data['message'] ?? 'Failed to fetch properties');
      }
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }

  @override
  Future<PropertyModel> createProperty(PropertyFormModel propertyForm) async {
    try {
      final url = ApiEndpoints.createProperty.path;

      // Create FormData for multipart upload
      final formData = FormData();

      // Add form fields
      final formDataMap = propertyForm.toFormData();
      formDataMap.forEach((key, value) {
        formData.fields.add(MapEntry(key, value));
      });

      // Add image files
      for (final imageFile in propertyForm.images) {
        final multipartFile = await MultipartFile.fromFile(
          imageFile.path,
          filename: imageFile.path.split('/').last,
        );
        formData.files.add(MapEntry('images', multipartFile));
      }

      final response = await dioClient.dio.post(
        url,
        data: formData,
      );

      if (response.statusCode == 201) {
        return PropertyModel.fromJson(response.data['data']);
      } else {
        throw Exception(
            response.data['message'] ?? 'Failed to create property');
      }
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }

  @override
  Future<void> deleteProperty(int propertyId) async {
    try {
      final url = ApiEndpoints.deleteProperty.path
          .replaceAll('{propertyId}', propertyId.toString());

      final response = await dioClient.dio.delete(url);

      if (response.statusCode != 200) {
        throw Exception(
            response.data['message'] ?? 'Failed to delete property');
      }
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }
}
