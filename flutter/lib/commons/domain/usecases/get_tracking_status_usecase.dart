import 'package:trees_india/commons/domain/entities/tracking_status_entity.dart';
import 'package:trees_india/commons/domain/repositories/location_tracking_repository.dart';

class GetTrackingStatusUsecase {
  final LocationTrackingRepository _repository;

  GetTrackingStatusUsecase(this._repository);

  Future<TrackingStatusEntity> call(int assignmentId) async {
    return await _repository.getTrackingStatus(assignmentId);
  }
}