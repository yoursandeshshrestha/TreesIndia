import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/domain/usecases/user_settings/get_notification_settings_usecase.dart';
import 'package:trees_india/commons/domain/usecases/user_settings/update_notification_settings_usecase.dart';
import 'package:trees_india/commons/domain/usecases/user_settings/request_delete_otp_usecase.dart';
import 'package:trees_india/commons/domain/usecases/user_settings/delete_account_usecase.dart';
import 'package:trees_india/commons/presenters/providers/user_settings_repository_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';

final getNotificationSettingsUsecaseProvider = Provider<GetNotificationSettingsUsecase>((ref) {
  final userSettingsRepository = ref.read(userSettingsRepositoryProvider);

  return GetNotificationSettingsUsecase(
    userSettingsRepository: userSettingsRepository,
  );
})
    ..registerProvider();

final updateNotificationSettingsUsecaseProvider = Provider<UpdateNotificationSettingsUsecase>((ref) {
  final userSettingsRepository = ref.read(userSettingsRepositoryProvider);

  return UpdateNotificationSettingsUsecase(
    userSettingsRepository: userSettingsRepository,
  );
})
    ..registerProvider();

final requestDeleteOtpUsecaseProvider = Provider<RequestDeleteOtpUsecase>((ref) {
  final userSettingsRepository = ref.read(userSettingsRepositoryProvider);

  return RequestDeleteOtpUsecase(
    userSettingsRepository: userSettingsRepository,
  );
})
    ..registerProvider();

final deleteAccountUsecaseProvider = Provider<DeleteAccountUsecase>((ref) {
  final userSettingsRepository = ref.read(userSettingsRepositoryProvider);

  return DeleteAccountUsecase(
    userSettingsRepository: userSettingsRepository,
  );
})
    ..registerProvider();