import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/viewmodels/notification_viewmodel/notification_notifier.dart';
import 'package:trees_india/commons/presenters/viewmodels/notification_viewmodel/notification_state.dart';
import 'package:trees_india/commons/presenters/providers/notification_usecase_providers.dart';
import 'package:trees_india/commons/presenters/providers/local_storage_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';

final notificationProvider = 
    StateNotifierProvider<NotificationNotifier, NotificationStateModel>((ref) {
  final registerDeviceUsecase = ref.read(registerDeviceUsecaseProvider);
  final getUserDevicesUsecase = ref.read(getUserDevicesUsecaseProvider);
  final checkDeviceStatusUsecase = ref.read(checkDeviceStatusUsecaseProvider);
  final unregisterDeviceUsecase = ref.read(unregisterDeviceUsecaseProvider);
  final localStorageService = ref.read(localStorageServiceProvider);

  return NotificationNotifier(
    registerDeviceUsecase: registerDeviceUsecase,
    getUserDevicesUsecase: getUserDevicesUsecase,
    checkDeviceStatusUsecase: checkDeviceStatusUsecase,
    unregisterDeviceUsecase: unregisterDeviceUsecase,
    localStorageService: localStorageService,
  );
})
    ..registerProvider();