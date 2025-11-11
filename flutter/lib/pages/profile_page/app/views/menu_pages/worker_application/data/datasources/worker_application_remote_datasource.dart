import 'dart:convert';
import 'package:dio/dio.dart';
import '../../../../../../../../commons/constants/api_endpoints.dart';
import '../../../../../../../../commons/utils/error_handler.dart';
import '../../../../../../../../commons/utils/services/dio_client.dart';
import '../models/worker_application_model.dart';
import '../models/role_application_response_model.dart';

class WorkerApplicationResponseModel {
  final bool success;
  final String message;
  final WorkerApplicationModel data;
  final String timestamp;

  WorkerApplicationResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory WorkerApplicationResponseModel.fromJson(Map<String, dynamic> json) {
    return WorkerApplicationResponseModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: WorkerApplicationModel.fromJson(json['data']),
      timestamp: json['timestamp'] ?? '',
    );
  }
}

// Using RoleApplicationResponseModel for the GET /role-applications/me endpoint

abstract class WorkerApplicationRemoteDataSource {
  Future<WorkerApplicationResponseModel> submitWorkerApplication(
      WorkerApplicationModel application);
  Future<RoleApplicationResponseModel> getUserApplicationStatus();
}

class WorkerApplicationRemoteDataSourceImpl
    implements WorkerApplicationRemoteDataSource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  WorkerApplicationRemoteDataSourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<WorkerApplicationResponseModel> submitWorkerApplication(
      WorkerApplicationModel application) async {
    try {
      final url = ApiEndpoints.submitWorkerApplication.path;

      final formData = FormData();

      // Add experience years as individual field
      formData.fields.add(MapEntry(
        'experience_years',
        application.skills.experienceYears.toString(),
      ));

      // Add skills as JSON array
      formData.fields.add(MapEntry(
        'skills',
        jsonEncode(application.skills.skills),
      ));

      // Add contact info as JSON object
      formData.fields.add(MapEntry(
        'contact_info',
        jsonEncode({
          'name': application.contactInfo.fullName,
          'email': application.contactInfo.email,
          'phone': application.contactInfo.phone,
          'alternative_number': application.contactInfo.alternativePhone,
        }),
      ));

      // Add address as JSON object
      formData.fields.add(MapEntry(
        'address',
        jsonEncode({
          'street': application.address.street,
          'city': application.address.city,
          'state': application.address.state,
          'pincode': application.address.pincode,
        }),
      ));

      // Add banking info as JSON object
      formData.fields.add(MapEntry(
        'banking_info',
        jsonEncode({
          'account_holder_name': application.bankingInfo.accountHolderName,
          'account_number': application.bankingInfo.accountNumber,
          'ifsc_code': application.bankingInfo.ifscCode,
          'bank_name': application.bankingInfo.bankName,
        }),
      ));

      // Add document files if they exist
      if (application.documents.aadhaarCard?.isNotEmpty == true) {
        final aadhaarFile = await MultipartFile.fromFile(
          application.documents.aadhaarCard!,
          filename: 'aadhaar_card.jpg',
        );
        formData.files.add(MapEntry('aadhar_card', aadhaarFile));
      }

      if (application.documents.panCard?.isNotEmpty == true) {
        final panFile = await MultipartFile.fromFile(
          application.documents.panCard!,
          filename: 'pan_card.jpg',
        );
        formData.files.add(MapEntry('pan_card', panFile));
      }

      if (application.documents.profilePhoto?.isNotEmpty == true) {
        final profileFile = await MultipartFile.fromFile(
          application.documents.profilePhoto!,
          filename: 'profile_photo.jpg',
        );
        formData.files.add(MapEntry('profile_pic', profileFile));
      }

      if (application.documents.policeVerification?.isNotEmpty == true) {
        final policeFile = await MultipartFile.fromFile(
          application.documents.policeVerification!,
          filename: 'police_verification.jpg',
        );
        formData.files.add(MapEntry('police_verification', policeFile));
      }

      final response = await dioClient.dio.post(
        url,
        data: formData,
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return WorkerApplicationResponseModel.fromJson(response.data);
      } else {
        throw Exception(
            response.data['message'] ?? 'Failed to submit worker application');
      }
    } on DioException {
      rethrow;
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }

  @override
  Future<RoleApplicationResponseModel> getUserApplicationStatus() async {
    try {
      final url = ApiEndpoints.getUserApplicationStatus.path;

      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200) {
        return RoleApplicationResponseModel.fromJson(response.data);
      } else {
        throw Exception(
            response.data['message'] ?? 'Failed to fetch application status');
      }
    } on DioException catch (e) {
      throw errorHandler.handleGenericError(e);
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }
}
