import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/viewmodels/user_settings_viewmodel/user_settings_notifier.dart';
import 'package:trees_india/commons/presenters/viewmodels/user_settings_viewmodel/user_settings_state.dart';
import 'package:trees_india/commons/presenters/providers/user_settings_usecase_providers.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';

final userSettingsProvider =
    StateNotifierProvider<UserSettingsNotifier, UserSettingsStateModel>((ref) {
  final getNotificationSettingsUsecase = ref.read(getNotificationSettingsUsecaseProvider);
  final updateNotificationSettingsUsecase = ref.read(updateNotificationSettingsUsecaseProvider);
  final requestDeleteOtpUsecase = ref.read(requestDeleteOtpUsecaseProvider);
  final deleteAccountUsecase = ref.read(deleteAccountUsecaseProvider);

  return UserSettingsNotifier(
    getNotificationSettingsUsecase: getNotificationSettingsUsecase,
    updateNotificationSettingsUsecase: updateNotificationSettingsUsecase,
    requestDeleteOtpUsecase: requestDeleteOtpUsecase,
    deleteAccountUsecase: deleteAccountUsecase,
  );
})
    ..registerProvider();