import 'package:trees_india/commons/domain/entities/worker_location_entity.dart';
import 'package:trees_india/commons/domain/entities/tracking_status_entity.dart';
import 'package:trees_india/commons/services/location_tracking_websocket_service.dart';

enum LocationTrackingState {
  initial,
  connecting,
  connected,
  tracking,
  stopped,
  error,
}

class LocationTrackingStateModel {
  final LocationTrackingState state;
  final LocationTrackingConnectionStatus connectionStatus;
  final WorkerLocationEntity? workerLocation;
  final TrackingStatusEntity? trackingStatus;
  final String? errorMessage;
  final bool isTrackingLocation;
  final int? currentAssignmentId;

  const LocationTrackingStateModel({
    this.state = LocationTrackingState.initial,
    this.connectionStatus = LocationTrackingConnectionStatus.disconnected,
    this.workerLocation,
    this.trackingStatus,
    this.errorMessage,
    this.isTrackingLocation = false,
    this.currentAssignmentId,
  });

  LocationTrackingStateModel copyWith({
    LocationTrackingState? state,
    LocationTrackingConnectionStatus? connectionStatus,
    WorkerLocationEntity? workerLocation,
    bool clearWorkerLocation = false,
    TrackingStatusEntity? trackingStatus,
    bool clearTrackingStatus = false,
    String? errorMessage,
    bool clearErrorMessage = false,
    bool? isTrackingLocation,
    int? currentAssignmentId,
    bool clearCurrentAssignmentId = false,
  }) {
    return LocationTrackingStateModel(
      state: state ?? this.state,
      connectionStatus: connectionStatus ?? this.connectionStatus,
      workerLocation: clearWorkerLocation ? null : (workerLocation ?? this.workerLocation),
      trackingStatus: clearTrackingStatus ? null : (trackingStatus ?? this.trackingStatus),
      errorMessage: clearErrorMessage ? null : (errorMessage ?? this.errorMessage),
      isTrackingLocation: isTrackingLocation ?? this.isTrackingLocation,
      currentAssignmentId: clearCurrentAssignmentId ? null : (currentAssignmentId ?? this.currentAssignmentId),
    );
  }
}