import '../entities/property_entity.dart';
import '../repositories/property_repository.dart';

class GetPropertyDetailsUseCase {
  final PropertyRepository repository;

  GetPropertyDetailsUseCase(this.repository);

  Future<PropertyEntity> execute(String propertyId) async {
    return await repository.getPropertyDetails(propertyId);
  }
}