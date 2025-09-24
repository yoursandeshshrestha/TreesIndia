import 'package:dio/dio.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';
import 'package:trees_india/commons/utils/error_handler.dart';
import 'package:trees_india/commons/utils/services/dio_client.dart';
import 'package:trees_india/pages/marketplace_vendors/data/models/vendor_response_model.dart';
import '../../../profile_page/app/views/menu_pages/my_vendor_profiles/data/models/vendor_model.dart';
import '../../domain/entities/vendor_filters_entity.dart';

abstract class VendorRemoteDatasource {
  Future<VendorResponseModel> getVendors(VendorFiltersEntity filters);
  Future<VendorModel> getVendorDetails(String vendorId);
}

class VendorRemoteDatasourceImpl implements VendorRemoteDatasource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  VendorRemoteDatasourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<VendorResponseModel> getVendors(VendorFiltersEntity filters) async {
    final url = ApiEndpoints.getVendors.path;

    try {
      final queryParams = filters.toQueryParams();

      final response = await dioClient.dio.get(
        url,
        queryParameters: queryParams,
      );

      if (response.statusCode == 200) {
        return VendorResponseModel.fromJson(response.data);
      } else {
        throw Exception('Failed to load vendors: ${response.statusCode}');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting vendors: $e');
    }
  }

  @override
  Future<VendorModel> getVendorDetails(String vendorId) async {
    final url = ApiEndpoints.getVendorDetails.path.replaceAll('{vendorId}', vendorId);

    try {
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200) {
        final responseData = response.data;
        if (responseData['success'] == true && responseData['data'] != null) {
          return VendorModel.fromJson(responseData['data']);
        } else {
          throw Exception('Failed to load vendor details: ${responseData['message'] ?? 'Unknown error'}');
        }
      } else {
        throw Exception('Failed to load vendor details: ${response.statusCode}');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting vendor details: $e');
    }
  }
}
