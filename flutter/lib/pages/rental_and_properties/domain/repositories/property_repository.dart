import '../../../profile_page/app/views/menu_pages/my_properties/domain/entities/property_entity.dart';
import '../entities/property_filters_entity.dart';

class PropertiesResponseEntity {
  final List<PropertyEntity> properties;
  final int total;
  final int page;
  final int limit;
  final int totalPages;
  final bool hasNext;
  final bool hasPrev;

  const PropertiesResponseEntity({
    required this.properties,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
    required this.hasNext,
    required this.hasPrev,
  });
}

abstract class PropertyRepository {
  Future<PropertiesResponseEntity> getProperties(PropertyFiltersEntity filters);
}