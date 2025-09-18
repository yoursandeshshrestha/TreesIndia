import 'package:dio/dio.dart';
import '../../../../../../../../commons/constants/api_endpoints.dart';
import '../../../../../../../../commons/utils/error_handler.dart';
import '../../../../../../../../commons/utils/services/dio_client.dart';
import '../models/vendor_model.dart';
import '../models/vendor_form_model.dart';

class VendorsResponseModel {
  final bool success;
  final String message;
  final List<VendorModel> data;
  final String timestamp;

  VendorsResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory VendorsResponseModel.fromJson(Map<String, dynamic> json) {
    return VendorsResponseModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: (json['data'] as List<dynamic>? ?? [])
          .map((item) => VendorModel.fromJson(item))
          .toList(),
      timestamp: json['timestamp'] ?? '',
    );
  }
}

class VendorResponseModel {
  final bool success;
  final String message;
  final VendorModel data;
  final String timestamp;

  VendorResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory VendorResponseModel.fromJson(Map<String, dynamic> json) {
    return VendorResponseModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: VendorModel.fromJson(json['data']),
      timestamp: json['timestamp'] ?? '',
    );
  }
}

abstract class VendorRemoteDataSource {
  Future<VendorsResponseModel> getUserVendors({
    int page = 1,
    int limit = 20,
  });

  Future<VendorResponseModel> createVendor(VendorFormModel vendorForm);

  Future<void> deleteVendor(int vendorId);
}

class VendorRemoteDataSourceImpl implements VendorRemoteDataSource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  VendorRemoteDataSourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<VendorsResponseModel> getUserVendors({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final url = ApiEndpoints.getUserVendors.path;
      final response = await dioClient.dio.get(
        url,
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      if (response.statusCode == 200) {
        return VendorsResponseModel.fromJson(response.data);
      } else {
        throw Exception(
            response.data['message'] ?? 'Failed to fetch vendor profiles');
      }
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }

  @override
  Future<VendorResponseModel> createVendor(VendorFormModel vendorForm) async {
    try {
      final url = ApiEndpoints.createVendor.path;

      // Create FormData for multipart upload
      final formData = FormData();

      // Add form fields
      formData.fields.add(MapEntry('vendor_name', vendorForm.vendorName));
      formData.fields
          .add(MapEntry('business_description', vendorForm.businessDescription));
      formData.fields
          .add(MapEntry('contact_person_name', vendorForm.contactPersonName));
      formData.fields
          .add(MapEntry('contact_person_phone', vendorForm.contactPersonPhone));
      formData.fields
          .add(MapEntry('contact_person_email', vendorForm.contactPersonEmail));
      formData.fields.add(MapEntry('business_type', _convertBusinessTypeForAPI(vendorForm.businessType)));
      formData.fields
          .add(MapEntry('years_in_business', vendorForm.yearsInBusiness.toString()));

      // Add business address as JSON string
      if (vendorForm.businessAddress.isNotEmpty) {
        formData.fields.add(MapEntry(
            'business_address',
            _encodeMap(vendorForm.businessAddress)));
      }

      // Add services offered
      for (final service in vendorForm.servicesOffered) {
        formData.fields.add(MapEntry('services_offered', service));
      }

      // Add profile picture if provided
      if (vendorForm.profilePicture.isNotEmpty) {
        final profilePictureFile = await MultipartFile.fromFile(
          vendorForm.profilePicture,
          filename: vendorForm.profilePicture.split('/').last,
        );
        formData.files.add(MapEntry('profile_picture', profilePictureFile));
      }

      // Add business gallery images
      for (final imagePath in vendorForm.businessGallery) {
        if (imagePath.isNotEmpty) {
          final multipartFile = await MultipartFile.fromFile(
            imagePath,
            filename: imagePath.split('/').last,
          );
          formData.files.add(MapEntry('business_gallery', multipartFile));
        }
      }

      final response = await dioClient.dio.post(
        url,
        data: formData,
      );

      if (response.statusCode == 201) {
        return VendorResponseModel.fromJson(response.data);
      } else {
        throw Exception(
            response.data['message'] ?? 'Failed to create vendor profile');
      }
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }

  @override
  Future<void> deleteVendor(int vendorId) async {
    try {
      final url = '${ApiEndpoints.getUserVendors.path}/$vendorId';

      final response = await dioClient.dio.delete(url);

      if (response.statusCode != 200) {
        throw Exception(
            response.data['message'] ?? 'Failed to delete vendor profile');
      }
    } on DioException catch (e) {
      throw errorHandler.handleError(e);
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }

  String _convertBusinessTypeForAPI(String businessType) {
    final typeMap = {
      'individual': 'individual',
      'partnership': 'partnership',
      'company': 'company',
      'llp': 'llp',
      'private limited': 'pvt_ltd',
      'public limited': 'public_ltd',
      'other': 'other',
    };

    return typeMap[businessType.toLowerCase()] ?? 'other';
  }

  String _encodeMap(Map<String, dynamic> map) {
    final buffer = StringBuffer();
    buffer.write('{');
    final entries = map.entries.toList();
    for (int i = 0; i < entries.length; i++) {
      final entry = entries[i];
      buffer.write('"${entry.key}": "${entry.value}"');
      if (i < entries.length - 1) {
        buffer.write(', ');
      }
    }
    buffer.write('}');
    return buffer.toString();
  }
}