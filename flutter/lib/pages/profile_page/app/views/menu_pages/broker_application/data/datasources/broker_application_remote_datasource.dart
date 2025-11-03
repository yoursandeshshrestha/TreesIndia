import 'dart:convert';
import 'package:dio/dio.dart';
import '../../../../../../../../commons/constants/api_endpoints.dart';
import '../../../../../../../../commons/utils/error_handler.dart';
import '../../../../../../../../commons/utils/services/dio_client.dart';
import '../models/broker_application_model.dart';
import '../models/broker_application_response_model.dart';

class SubmitBrokerApplicationResponseModel {
  final bool success;
  final String message;
  final BrokerApplicationModel data;
  final String timestamp;

  SubmitBrokerApplicationResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory SubmitBrokerApplicationResponseModel.fromJson(Map<String, dynamic> json) {
    return SubmitBrokerApplicationResponseModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: BrokerApplicationModel.fromJson(json['data']),
      timestamp: json['timestamp'] ?? '',
    );
  }
}

abstract class BrokerApplicationRemoteDataSource {
  Future<SubmitBrokerApplicationResponseModel> submitBrokerApplication(
      BrokerApplicationModel application);
  Future<BrokerApplicationResponseModel> getUserApplicationStatus();
}

class BrokerApplicationRemoteDataSourceImpl
    implements BrokerApplicationRemoteDataSource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  BrokerApplicationRemoteDataSourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<SubmitBrokerApplicationResponseModel> submitBrokerApplication(
      BrokerApplicationModel application) async {
    try {
      final url = ApiEndpoints.submitBrokerApplication.path;

      final formData = FormData();

      // Add broker details as individual fields
      formData.fields.add(MapEntry(
        'license',
        application.brokerDetails.licenseNumber,
      ));

      formData.fields.add(MapEntry(
        'agency',
        application.brokerDetails.agencyName,
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

      final response = await dioClient.dio.post(
        url,
        data: formData,
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return SubmitBrokerApplicationResponseModel.fromJson(response.data);
      } else {
        throw Exception(
            response.data['message'] ?? 'Failed to submit broker application');
      }
    } on DioException catch (e) {
      throw e;
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }

  @override
  Future<BrokerApplicationResponseModel> getUserApplicationStatus() async {
    try {
      final url = ApiEndpoints.getUserApplicationStatus.path;

      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200) {
        return BrokerApplicationResponseModel.fromJson(response.data);
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
