abstract class CentralizedDataRepository {
  Future<void> logout();
  Future<bool> resetPassword(String email);
}
