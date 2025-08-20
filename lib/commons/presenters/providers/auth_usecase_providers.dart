import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/domain/usecases/get_user_profile_usecase.dart';
import 'package:trees_india/commons/domain/usecases/refresh_token_usecase.dart';
import 'package:trees_india/commons/domain/usecases/verify_otp_usecase.dart';
import 'package:trees_india/commons/presenters/providers/auth_repository_provider.dart';
import 'package:trees_india/pages/login_page/domain/usecases/login_usecase.dart';

final loginUsecaseProvider = Provider<LoginUsecase>((ref) {
  final authRepository = ref.read(authRepositoryProvider);
  return LoginUsecase(authRepository: authRepository);
});

final verifyOtpUsecaseProvider = Provider<VerifyOtpUsecase>((ref) {
  final authRepository = ref.read(authRepositoryProvider);
  return VerifyOtpUsecase(authRepository: authRepository);
});

final refreshTokenUsecaseProvider = Provider<RefreshTokenUsecase>((ref) {
  final authRepository = ref.read(authRepositoryProvider);
  return RefreshTokenUsecase(authRepository: authRepository);
});

final getUserProfileUsecaseProvider = Provider<GetUserProfileUsecase>((ref) {
  final authRepository = ref.read(authRepositoryProvider);
  return GetUserProfileUsecase(authRepository: authRepository);
});
