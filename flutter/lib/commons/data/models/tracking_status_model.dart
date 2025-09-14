import '../../domain/entities/tracking_status_entity.dart';

class TrackingStatusModel extends TrackingStatusEntity {
  const TrackingStatusModel({
    required super.assignmentId,
    required super.bookingId,
    required super.workerId,
    required super.isTracking,
    required super.status,
    super.trackingStartedAt,
    super.lastLocationUpdate,
    super.workerName,
    super.customerName,
    super.workerLatitude,
    super.workerLongitude,
    super.workerAccuracy,
  });

  factory TrackingStatusModel.fromJson(Map<String, dynamic> json) {
    return TrackingStatusModel(
      assignmentId: json['assignment_id'] ?? 0,
      bookingId: json['booking_id'] ?? 0,
      workerId: json['worker_id'] ?? 0,
      isTracking: json['is_tracking'] ?? false,
      status: json['status'] ?? 'not_started',
      trackingStartedAt: json['tracking_started_at'] != null 
          ? DateTime.parse(json['tracking_started_at']) 
          : null,
      lastLocationUpdate: json['last_location_update'] != null 
          ? DateTime.parse(json['last_location_update']) 
          : null,
      workerName: json['worker_name'],
      customerName: json['customer_name'],
      workerLatitude: json['worker_location'] != null 
          ? (json['worker_location']['latitude'] ?? 0.0).toDouble()
          : null,
      workerLongitude: json['worker_location'] != null 
          ? (json['worker_location']['longitude'] ?? 0.0).toDouble()
          : null,
      workerAccuracy: json['worker_location'] != null 
          ? (json['worker_location']['accuracy'] ?? 0.0).toDouble()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'assignment_id': assignmentId,
      'booking_id': bookingId,
      'worker_id': workerId,
      'is_tracking': isTracking,
      'status': status,
      'tracking_started_at': trackingStartedAt?.toIso8601String(),
      'last_location_update': lastLocationUpdate?.toIso8601String(),
      'worker_name': workerName,
      'customer_name': customerName,
      if (workerLatitude != null && workerLongitude != null)
        'worker_location': {
          'latitude': workerLatitude,
          'longitude': workerLongitude,
          'accuracy': workerAccuracy ?? 0.0,
        },
    };
  }

  factory TrackingStatusModel.fromEntity(TrackingStatusEntity entity) {
    return TrackingStatusModel(
      assignmentId: entity.assignmentId,
      bookingId: entity.bookingId,
      workerId: entity.workerId,
      isTracking: entity.isTracking,
      status: entity.status,
      trackingStartedAt: entity.trackingStartedAt,
      lastLocationUpdate: entity.lastLocationUpdate,
      workerName: entity.workerName,
      customerName: entity.customerName,
      workerLatitude: entity.workerLatitude,
      workerLongitude: entity.workerLongitude,
      workerAccuracy: entity.workerAccuracy,
    );
  }

  TrackingStatusEntity toEntity() {
    return TrackingStatusEntity(
      assignmentId: assignmentId,
      bookingId: bookingId,
      workerId: workerId,
      isTracking: isTracking,
      status: status,
      trackingStartedAt: trackingStartedAt,
      lastLocationUpdate: lastLocationUpdate,
      workerName: workerName,
      customerName: customerName,
      workerLatitude: workerLatitude,
      workerLongitude: workerLongitude,
      workerAccuracy: workerAccuracy,
    );
  }
}