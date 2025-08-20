import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';
import '../../data/datasources/profile_datasource.dart';
import '../../data/repositories/profile_repository_impl.dart';
import '../../domain/repositories/profile_repository.dart';
import '../../domain/usecases/update_profile_usecase.dart';
import '../../domain/usecases/upload_avatar_usecase.dart';
import '../../domain/usecases/get_profile_usecase.dart';

final profileDatasourceProvider = Provider<ProfileDatasource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);
  return ProfileDatasource(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  final datasource = ref.read(profileDatasourceProvider);
  return ProfileRepositoryImpl(datasource: datasource);
});

final updateProfileUsecaseProvider = Provider<UpdateProfileUsecase>((ref) {
  final repository = ref.read(profileRepositoryProvider);
  return UpdateProfileUsecase(profileRepository: repository);
});

final uploadAvatarUsecaseProvider = Provider<UploadAvatarUsecase>((ref) {
  final repository = ref.read(profileRepositoryProvider);
  return UploadAvatarUsecase(profileRepository: repository);
});

final getProfileUsecaseProvider = Provider<GetProfileUsecase>((ref) {
  final repository = ref.read(profileRepositoryProvider);
  return GetProfileUsecase(profileRepository: repository);
});
