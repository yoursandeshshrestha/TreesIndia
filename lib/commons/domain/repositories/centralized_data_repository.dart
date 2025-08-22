import '../entities/location_entity.dart';

abstract class CentralizedDataRepository {
  Future<void> logout();
  Future<bool> resetPassword(String email);
  Future<List<LocationEntity>> searchLocations(String query);
}
