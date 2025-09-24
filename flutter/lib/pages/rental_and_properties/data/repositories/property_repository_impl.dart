import '../../domain/entities/property_filters_entity.dart';
import '../../domain/repositories/property_repository.dart';
import '../datasources/property_remote_datasource.dart';

class PropertyRepositoryImpl implements PropertyRepository {
  final PropertyRemoteDatasource remoteDatasource;

  PropertyRepositoryImpl(this.remoteDatasource);

  @override
  Future<PropertiesResponseEntity> getProperties(PropertyFiltersEntity filters) async {
    final responseModel = await remoteDatasource.getProperties(filters);

    return PropertiesResponseEntity(
      properties: responseModel.properties.map((model) => model.toEntity()).toList(),
      total: responseModel.total,
      page: responseModel.page,
      limit: responseModel.limit,
      totalPages: responseModel.totalPages,
      hasNext: responseModel.hasNext,
      hasPrev: responseModel.hasPrev,
    );
  }
}