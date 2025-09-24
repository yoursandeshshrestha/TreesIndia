import '../entities/property_entity.dart';
import '../repositories/property_repository.dart';

class GetUserPropertiesUseCase {
  final PropertyRepository repository;

  GetUserPropertiesUseCase(this.repository);

  Future<List<PropertyEntity>> execute({
    int page = 1,
    int limit = 20,
  }) async {
    return await repository.getUserProperties(page: page, limit: limit);
  }
}