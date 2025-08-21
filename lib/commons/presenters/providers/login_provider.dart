import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/viewmodels/login_viewmodel/login_notifier.dart';
import 'package:trees_india/commons/presenters/viewmodels/login_viewmodel/login_state.dart';
import 'package:trees_india/commons/presenters/providers/login_usecase_providers.dart';
import 'package:trees_india/commons/presenters/providers/local_storage_provider.dart';
import 'package:trees_india/commons/presenters/providers/notification_service_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';

final loginProvider =
    StateNotifierProvider<LoginNotifier, LoginStateModel>((ref) {
  final loginUsecase = ref.read(loginUsecaseProvider);
  final verifyOtpUsecase = ref.read(verifyOtpUsecaseProvider);
  final refreshTokenUsecase = ref.read(refreshTokenUsecaseProvider);
  final getUserProfileUsecase = ref.read(getUserProfileUsecaseProvider);
  final localStorageService = ref.read(localStorageServiceProvider);
  final notificationService = ref.read(notificationServiceProvider);

  return LoginNotifier(
    loginUsecase: loginUsecase,
    verifyOtpUsecase: verifyOtpUsecase,
    refreshTokenUsecase: refreshTokenUsecase,
    getUserProfileUsecase: getUserProfileUsecase,
    localStorageService: localStorageService,
    notificationService: notificationService,
    ref: ref,
  );
})
      ..registerProvider();
