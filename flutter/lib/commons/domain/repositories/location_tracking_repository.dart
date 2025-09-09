import '../entities/tracking_status_entity.dart';

abstract class LocationTrackingRepository {
  Future<TrackingStatusEntity> getTrackingStatus(int assignmentId);
}