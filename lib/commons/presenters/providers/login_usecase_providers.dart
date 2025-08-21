import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/domain/usecases/get_user_profile_usecase.dart';
import 'package:trees_india/commons/domain/usecases/refresh_token_usecase.dart';
import 'package:trees_india/commons/domain/usecases/verify_otp_usecase.dart';
import 'package:trees_india/commons/presenters/providers/login_repository_provider.dart';
import 'package:trees_india/pages/login_page/domain/usecases/login_usecase.dart';

final loginUsecaseProvider = Provider<LoginUsecase>((ref) {
  final loginRepository = ref.read(loginRepositoryProvider);
  return LoginUsecase(loginRepository: loginRepository);
});

final verifyOtpUsecaseProvider = Provider<VerifyOtpUsecase>((ref) {
  final loginRepository = ref.read(loginRepositoryProvider);
  return VerifyOtpUsecase(loginRepository: loginRepository);
});

final refreshTokenUsecaseProvider = Provider<RefreshTokenUsecase>((ref) {
  final loginRepository = ref.read(loginRepositoryProvider);
  return RefreshTokenUsecase(loginRepository: loginRepository);
});

final getUserProfileUsecaseProvider = Provider<GetUserProfileUsecase>((ref) {
  final loginRepository = ref.read(loginRepositoryProvider);
  return GetUserProfileUsecase(loginRepository: loginRepository);
});
