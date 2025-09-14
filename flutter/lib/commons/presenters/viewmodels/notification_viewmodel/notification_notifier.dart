import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:trees_india/commons/domain/entities/device_registration_entity.dart';
import 'package:trees_india/commons/domain/usecases/register_device_usecase.dart';
import 'package:trees_india/commons/domain/usecases/get_user_devices_usecase.dart';
import 'package:trees_india/commons/domain/usecases/check_device_status_usecase.dart';
import 'package:trees_india/commons/domain/usecases/unregister_device_usecase.dart';
import 'package:trees_india/commons/utils/services/centralized_local_storage_service.dart';
import 'package:logger/logger.dart';

import 'notification_state.dart';

final Logger _logger = Logger();

class NotificationNotifier extends StateNotifier<NotificationStateModel> {
  final RegisterDeviceUsecase registerDeviceUsecase;
  final GetUserDevicesUsecase getUserDevicesUsecase;
  final CheckDeviceStatusUsecase checkDeviceStatusUsecase;
  final UnregisterDeviceUsecase unregisterDeviceUsecase;
  final CentralizedLocalStorageService localStorageService;

  NotificationNotifier({
    required this.registerDeviceUsecase,
    required this.getUserDevicesUsecase,
    required this.checkDeviceStatusUsecase,
    required this.unregisterDeviceUsecase,
    required this.localStorageService,
  }) : super(const NotificationStateModel());

  Future<void> registerDeviceWithToken(String fcmToken, int userId) async {
    if (state.isRegistering) return;

    try {
      state = state.copyWith(isRegistering: true, error: '');

      final deviceInfo = await _getDeviceInfo();
      final deviceRegistration = DeviceRegistrationEntity(
        userId: userId,
        token: fcmToken,
        platform: _getPlatform(),
        appVersion: deviceInfo['appVersion']!,
        deviceModel: deviceInfo['deviceModel']!,
        osVersion: deviceInfo['osVersion']!,
      );

      final success = await registerDeviceUsecase.call(deviceRegistration);

      if (success) {
        await localStorageService.saveData('FCM_DEVICE_REGISTERED', 'true');
        state = state.copyWith(
          isRegistering: false,
          isRegistered: true,
          fcmToken: fcmToken,
        );
        _logger.i('Device registered successfully with FCM token');
      } else {
        throw Exception('Failed to register device');
      }
    } catch (e) {
      _logger.e('Error registering device: $e');
      state = state.copyWith(
        isRegistering: false,
        error: 'Failed to register device: ${e.toString()}',
      );
    }
  }

  Future<void> checkDeviceStatus(String fcmToken) async {
    if (state.isCheckingStatus) return;

    try {
      state = state.copyWith(isCheckingStatus: true, error: '');

      final deviceStatus = await checkDeviceStatusUsecase.call(fcmToken);

      state = state.copyWith(
        isCheckingStatus: false,
        deviceStatus: deviceStatus,
        isRegistered: deviceStatus.isRegistered,
        fcmToken: fcmToken,
      );
    } catch (e) {
      _logger.e('Error checking device status: $e');
      state = state.copyWith(
        isCheckingStatus: false,
        error: 'Failed to check device status: ${e.toString()}',
      );
    }
  }

  Future<void> getUserDevices() async {
    if (state.isLoadingDevices) return;

    try {
      state = state.copyWith(isLoadingDevices: true, error: '');

      final devices = await getUserDevicesUsecase.call();

      state = state.copyWith(
        isLoadingDevices: false,
        userDevices: devices,
      );
    } catch (e) {
      _logger.e('Error getting user devices: $e');
      state = state.copyWith(
        isLoadingDevices: false,
        error: 'Failed to get devices: ${e.toString()}',
      );
    }
  }

  Future<void> unregisterDevice(String fcmToken) async {
    if (state.isUnregistering) return;

    try {
      state = state.copyWith(isUnregistering: true, error: '');

      final success = await unregisterDeviceUsecase.call(fcmToken);

      if (success) {
        await localStorageService.deleteData('FCM_DEVICE_REGISTERED');
        state = state.copyWith(
          isUnregistering: false,
          isRegistered: false,
          fcmToken: null,
        );
        _logger.i('Device unregistered successfully');
      } else {
        throw Exception('Failed to unregister device');
      }
    } catch (e) {
      _logger.e('Error unregistering device: $e');
      state = state.copyWith(
        isUnregistering: false,
        error: 'Failed to unregister device: ${e.toString()}',
      );
    }
  }

  Future<void> autoRegisterIfNeeded(String fcmToken, int userId) async {
    // Check if device is already registered locally
    final isRegisteredLocally = await localStorageService.getData('FCM_DEVICE_REGISTERED');
    
    if (isRegisteredLocally == 'true') {
      state = state.copyWith(isRegistered: true, fcmToken: fcmToken);
      return;
    }

    // Check with server
    await checkDeviceStatus(fcmToken);

    // If not registered, register automatically
    if (!state.isRegistered) {
      await registerDeviceWithToken(fcmToken, userId);
    } else {
      // Update local storage if registered on server but not locally
      await localStorageService.saveData('FCM_DEVICE_REGISTERED', 'true');
    }
  }

  void clearError() {
    state = state.clearError();
  }

  String _getPlatform() {
    if (kIsWeb) return 'web';
    if (Platform.isAndroid) return 'android';
    if (Platform.isIOS) return 'ios';
    return 'unknown';
  }

  Future<Map<String, String>> _getDeviceInfo() async {
    final deviceInfoPlugin = DeviceInfoPlugin();
    final packageInfo = await PackageInfo.fromPlatform();
    
    String deviceModel = 'Unknown';
    String osVersion = 'Unknown';

    if (Platform.isAndroid) {
      final androidInfo = await deviceInfoPlugin.androidInfo;
      deviceModel = '${androidInfo.manufacturer} ${androidInfo.model}';
      osVersion = 'Android ${androidInfo.version.release}';
    } else if (Platform.isIOS) {
      final iosInfo = await deviceInfoPlugin.iosInfo;
      deviceModel = '${iosInfo.name} ${iosInfo.model}';
      osVersion = '${iosInfo.systemName} ${iosInfo.systemVersion}';
    }

    return {
      'appVersion': '${packageInfo.version}+${packageInfo.buildNumber}',
      'deviceModel': deviceModel,
      'osVersion': osVersion,
    };
  }
}