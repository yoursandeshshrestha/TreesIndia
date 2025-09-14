import 'package:dio/dio.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';
import 'package:trees_india/commons/utils/error_handler.dart';
import 'package:trees_india/commons/utils/services/dio_client.dart';

import '../models/device_registration_model.dart';
import '../models/device_model.dart';
import '../models/device_status_model.dart';

class NotificationRemoteDatasource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  NotificationRemoteDatasource({
    required this.dioClient,
    required this.errorHandler,
  });

  Future<bool> registerDevice(DeviceRegistrationModel deviceRegistration) async {
    final url = ApiEndpoints.registerDevice.path;

    try {
      final response = await dioClient.dio.post(
        url,
        data: deviceRegistration.toJson(),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return true;
      } else {
        throw Exception(response.data['message'] ?? 'Failed to register device');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error registering device: ${e.toString()}');
    }
  }

  Future<List<DeviceModel>> getUserDevices() async {
    final url = ApiEndpoints.getUserDevices.path;

    try {
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> devicesData = response.data['data'] ?? [];
        return devicesData.map((json) => DeviceModel.fromJson(json)).toList();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to get devices');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting devices: ${e.toString()}');
    }
  }

  Future<DeviceStatusModel> checkDeviceStatus(String fcmToken) async {
    try {
      // Use getUserDevices to get all devices and check if fcmToken exists
      final devices = await getUserDevices();
      
      // Find device with matching token
      final matchingDevice = devices.cast<DeviceModel?>().firstWhere(
        (device) => device?.token == fcmToken,
        orElse: () => null,
      );

      if (matchingDevice != null) {
        return DeviceStatusModel(
          isRegistered: matchingDevice.isActive,
          token: matchingDevice.token,
          registeredAt: matchingDevice.registeredAt,
          lastUsedAt: matchingDevice.lastUsedAt,
        );
      } else {
        return DeviceStatusModel(isRegistered: false);
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      return DeviceStatusModel(isRegistered: false);
    }
  }

  Future<bool> unregisterDevice(String fcmToken) async {
    final url = ApiEndpoints.unregisterDevice.path;

    try {
      final response = await dioClient.dio.delete(
        url,
        queryParameters: {'token': fcmToken},
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return true;
      } else {
        throw Exception(response.data['message'] ?? 'Failed to unregister device');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error unregistering device: ${e.toString()}');
    }
  }
}