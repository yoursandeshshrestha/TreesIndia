import 'package:logger/logger.dart';
import 'package:trees_india/commons/domain/repositories/location_tracking_repository.dart';
import 'package:trees_india/commons/domain/entities/tracking_status_entity.dart';

import '../datasources/location_tracking_datasource.dart';

class LocationTrackingRepositoryImpl implements LocationTrackingRepository {
  final LocationTrackingDatasource locationTrackingDatasource;
  final Logger logger = Logger();

  LocationTrackingRepositoryImpl({
    required this.locationTrackingDatasource,
  });

  @override
  Future<TrackingStatusEntity> getTrackingStatus(int assignmentId) async {
    try {
      logger.d('Getting tracking status for assignment $assignmentId');
      final trackingStatusModel = await locationTrackingDatasource.getTrackingStatus(assignmentId);
      return trackingStatusModel.toEntity();
    } catch (e) {
      logger.e('Error getting tracking status: $e');
      rethrow;
    }
  }
}