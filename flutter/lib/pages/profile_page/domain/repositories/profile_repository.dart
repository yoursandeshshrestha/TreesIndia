import '../entities/profile_update_entity.dart';
import '../entities/avatar_upload_entity.dart';
import 'package:trees_india/commons/domain/entities/user_profile_entity.dart';

abstract class ProfileRepository {
  Future<ProfileUpdateResponseEntity> updateProfile(
      ProfileUpdateRequestEntity request);
  Future<AvatarUploadResponseEntity> uploadAvatar(
      AvatarUploadRequestEntity request);
  Future<UserProfileResponseEntity> getUserProfile();
}
