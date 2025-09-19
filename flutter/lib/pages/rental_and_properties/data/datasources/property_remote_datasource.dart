import 'package:trees_india/commons/constants/api_endpoints.dart';

import '../../../../commons/utils/services/dio_client.dart';
import '../../../profile_page/app/views/menu_pages/my_properties/data/models/property_model.dart';
import '../../domain/entities/property_filters_entity.dart';

class PropertyRemoteDatasource {
  final DioClient dioClient;

  PropertyRemoteDatasource(this.dioClient);

  Future<PropertiesResponseModel> getProperties(
      PropertyFiltersEntity filters) async {
    try {
      final queryParams = filters.toQueryParams();

      final response = await dioClient.dio.get(
        ApiEndpoints.getProperties.path,
        queryParameters: queryParams,
      );

      return PropertiesResponseModel.fromJson(response.data);
    } catch (e) {
      print('Error fetching properties: $e');
      rethrow;
    }
  }
}
