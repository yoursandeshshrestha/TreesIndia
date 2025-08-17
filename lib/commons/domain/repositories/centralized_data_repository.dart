import 'package:trees_india/commons/domain/entities/user_entity.dart';

abstract class CentralizedDataRepository {
  // Future<TokenEntity> getTokenByEmailAndPassword(String email, String password);
  Future<void> logout();
  Future<bool> resetPassword(String email);
  Future<bool> changePassword(
      String email, String currentPassword, String newPassword);
  Future<UserEntity> getUserProfile();
}
