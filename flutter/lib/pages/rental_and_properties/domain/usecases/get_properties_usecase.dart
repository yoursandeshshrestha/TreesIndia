import '../entities/property_filters_entity.dart';
import '../repositories/property_repository.dart';

class GetPropertiesUsecase {
  final PropertyRepository repository;

  GetPropertiesUsecase(this.repository);

  Future<PropertiesResponseEntity> call(PropertyFiltersEntity filters) {
    return repository.getProperties(filters);
  }
}