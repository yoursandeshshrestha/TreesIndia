import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_properties/data/models/property_form_data.dart';

import '../entities/property_entity.dart';
import '../repositories/property_repository.dart';

class CreatePropertyUseCase {
  final PropertyRepository repository;

  CreatePropertyUseCase(this.repository);

  Future<PropertyEntity> execute(PropertyFormData propertyForm) async {
    return await repository.createProperty(propertyForm);
  }
}
