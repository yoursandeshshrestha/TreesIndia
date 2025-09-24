import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_properties/data/models/property_form_data.dart';

import '../../domain/entities/property_entity.dart';
import '../../domain/entities/property_form_entity.dart';
import '../../domain/repositories/property_repository.dart';
import '../datasources/property_remote_datasource.dart';
import '../models/property_form_model.dart';

class PropertyRepositoryImpl implements PropertyRepository {
  final PropertyRemoteDataSource remoteDataSource;

  PropertyRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<PropertyEntity>> getUserProperties({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await remoteDataSource.getUserProperties(
      page: page,
      limit: limit,
    );
    return response.properties.map((property) => property.toEntity()).toList();
  }

  @override
  Future<PropertyEntity> createProperty(PropertyFormData propertyForm) async {
    final propertyFormModel = PropertyFormModel(
      title: propertyForm.title,
      description: propertyForm.description,
      propertyType: propertyForm.propertyType,
      listingType: propertyForm.listingType,
      state: propertyForm.state,
      city: propertyForm.city,
      address: propertyForm.address,
      pincode: propertyForm.pincode,
      bedrooms: propertyForm.bedrooms,
      bathrooms: propertyForm.bathrooms,
      area: propertyForm.area,
      floorNumber: propertyForm.floorNumber,
      age: propertyForm.age,
      furnishingStatus: propertyForm.furnishingStatus,
      images: propertyForm.images,
      salePrice: propertyForm.salePrice,
      monthlyRent: propertyForm.monthlyRent,
      priceNegotiable: propertyForm.priceNegotiable,
    );

    final propertyModel =
        await remoteDataSource.createProperty(propertyFormModel);
    return propertyModel.toEntity();
  }

  @override
  Future<void> deleteProperty(int propertyId) async {
    await remoteDataSource.deleteProperty(propertyId);
  }

  @override
  Future<PropertyEntity> getPropertyDetails(String propertyId) async {
    final propertyModel = await remoteDataSource.getPropertyDetails(propertyId);
    return propertyModel.toEntity();
  }
}
