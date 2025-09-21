import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_properties/data/models/property_form_data.dart';

import '../entities/property_entity.dart';

abstract class PropertyRepository {
  Future<List<PropertyEntity>> getUserProperties({
    int page = 1,
    int limit = 20,
  });

  Future<PropertyEntity> createProperty(PropertyFormData propertyForm);

  Future<void> deleteProperty(int propertyId);

  Future<PropertyEntity> getPropertyDetails(String propertyId);
}
