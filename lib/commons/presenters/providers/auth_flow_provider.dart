import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/app/viewmodels/auth_notifier.dart';
import 'package:trees_india/commons/app/viewmodels/auth_state.dart'
    as auth_flow;
import 'package:trees_india/commons/presenters/providers/auth_usecase_providers.dart';
import 'package:trees_india/commons/presenters/providers/local_storage_provider.dart';
import 'package:trees_india/commons/presenters/providers/notification_service_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';

final authFlowProvider =
    StateNotifierProvider<AuthFlowNotifier, auth_flow.AuthFlowStateModel>(
        (ref) {
  final loginUsecase = ref.read(loginUsecaseProvider);
  final registerUsecase = ref.read(registerUsecaseProvider);
  final verifyOtpUsecase = ref.read(verifyOtpUsecaseProvider);
  final refreshTokenUsecase = ref.read(refreshTokenUsecaseProvider);
  final getUserProfileUsecase = ref.read(getUserProfileUsecaseProvider);
  final localStorageService = ref.read(localStorageServiceProvider);
  final notificationService = ref.read(notificationServiceProvider);

  return AuthFlowNotifier(
    loginUsecase: loginUsecase,
    registerUsecase: registerUsecase,
    verifyOtpUsecase: verifyOtpUsecase,
    refreshTokenUsecase: refreshTokenUsecase,
    getUserProfileUsecase: getUserProfileUsecase,
    localStorageService: localStorageService,
    notificationService: notificationService,
    ref: ref,
  );
})
      ..registerProvider();
