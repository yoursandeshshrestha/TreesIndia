import '../entities/service_response_entity.dart';

abstract class ServiceRepository {
  Future<ServiceResponseEntity> getServices({
    required String city,
    required String state,
    required int categoryId,
    required int subcategoryId,
    int page = 1,
    int limit = 10,
  });
}