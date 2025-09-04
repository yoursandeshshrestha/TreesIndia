import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/domain/usecases/register_device_usecase.dart';
import 'package:trees_india/commons/domain/usecases/get_user_devices_usecase.dart';
import 'package:trees_india/commons/domain/usecases/check_device_status_usecase.dart';
import 'package:trees_india/commons/domain/usecases/unregister_device_usecase.dart';
import 'package:trees_india/commons/presenters/providers/notification_repository_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';

final registerDeviceUsecaseProvider = Provider<RegisterDeviceUsecase>((ref) {
  final notificationRepository = ref.read(notificationRepositoryProvider);

  return RegisterDeviceUsecase(
    notificationRepository: notificationRepository,
  );
})
    ..registerProvider();

final getUserDevicesUsecaseProvider = Provider<GetUserDevicesUsecase>((ref) {
  final notificationRepository = ref.read(notificationRepositoryProvider);

  return GetUserDevicesUsecase(
    notificationRepository: notificationRepository,
  );
})
    ..registerProvider();

final checkDeviceStatusUsecaseProvider = Provider<CheckDeviceStatusUsecase>((ref) {
  final notificationRepository = ref.read(notificationRepositoryProvider);

  return CheckDeviceStatusUsecase(
    notificationRepository: notificationRepository,
  );
})
    ..registerProvider();

final unregisterDeviceUsecaseProvider = Provider<UnregisterDeviceUsecase>((ref) {
  final notificationRepository = ref.read(notificationRepositoryProvider);

  return UnregisterDeviceUsecase(
    notificationRepository: notificationRepository,
  );
})
    ..registerProvider();