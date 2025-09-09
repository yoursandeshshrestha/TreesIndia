import 'package:dio/dio.dart';
import 'package:trees_india/commons/data/models/tracking_status_model.dart';
import 'package:trees_india/commons/utils/error_handler.dart';
import 'package:trees_india/commons/utils/services/dio_client.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';

abstract class LocationTrackingDatasource {
  Future<TrackingStatusModel> getTrackingStatus(int assignmentId);
}

class LocationTrackingDatasourceImpl implements LocationTrackingDatasource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  LocationTrackingDatasourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<TrackingStatusModel> getTrackingStatus(int assignmentId) async {
    final url = ApiEndpoints.getTrackingStatus.path
        .replaceAll('{assignmentId}', assignmentId.toString());

    try {
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200 && response.data['data'] != null) {
        return TrackingStatusModel.fromJson(response.data['data']);
      } else {
        throw Exception('Failed to get tracking status.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting tracking status.');
    }
  }
}
