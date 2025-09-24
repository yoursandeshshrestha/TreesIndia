import '../../domain/repositories/profile_repository.dart';
import '../../domain/entities/profile_update_entity.dart';
import '../../domain/entities/avatar_upload_entity.dart';
import 'package:trees_india/commons/domain/entities/user_profile_entity.dart';
import '../datasources/profile_datasource.dart';
import '../models/profile_update_model.dart';
import '../models/avatar_upload_model.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  final ProfileDatasource datasource;

  ProfileRepositoryImpl({required this.datasource});

  @override
  Future<ProfileUpdateResponseEntity> updateProfile(
      ProfileUpdateRequestEntity request) async {
    try {
      final requestModel = ProfileUpdateRequestModel(
        name: request.name,
        email: request.email,
        gender: request.gender,
      );

      final response = await datasource.updateProfile(requestModel);
      return response.toEntity();
    } catch (e) {
      // Preserve server-provided error messages (e.g., "Email already exists")
      if (e is Exception) {
        print('ProfileRepositoryImpl: Exception: ${e.toString()}');
        final message = e.toString().replaceFirst('Exception: ', '');
        throw Exception(message);
      }
      throw Exception('Failed to update profile. Please try again.');
    }
  }

  @override
  Future<AvatarUploadResponseEntity> uploadAvatar(
      AvatarUploadRequestEntity request) async {
    try {
      final requestModel = AvatarUploadRequestModel(
        fileData: request.fileData,
        fileName: request.fileName,
      );

      final response = await datasource.uploadAvatar(requestModel);
      return response.toEntity();
    } catch (e) {
      throw Exception('Failed to upload avatar. Please try again.');
    }
  }

  @override
  Future<UserProfileResponseEntity> getUserProfile() async {
    try {
      final response = await datasource.getUserProfile();
      return response.toEntity();
    } catch (e) {
      throw Exception('Failed to get user profile. Please try again.');
    }
  }
}
