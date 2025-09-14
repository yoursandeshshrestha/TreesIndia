import 'package:equatable/equatable.dart';

class TrackingStatusEntity extends Equatable {
  final int assignmentId;
  final int bookingId;
  final int workerId;
  final bool isTracking;
  final String status;
  final DateTime? trackingStartedAt;
  final DateTime? lastLocationUpdate;
  final String? workerName;
  final String? customerName;
  final double? workerLatitude;
  final double? workerLongitude;
  final double? workerAccuracy;

  const TrackingStatusEntity({
    required this.assignmentId,
    required this.bookingId,
    required this.workerId,
    required this.isTracking,
    required this.status,
    this.trackingStartedAt,
    this.lastLocationUpdate,
    this.workerName,
    this.customerName,
    this.workerLatitude,
    this.workerLongitude,
    this.workerAccuracy,
  });

  @override
  List<Object?> get props => [
        assignmentId,
        bookingId,
        workerId,
        isTracking,
        status,
        trackingStartedAt,
        lastLocationUpdate,
        workerName,
        customerName,
        workerLatitude,
        workerLongitude,
        workerAccuracy,
      ];

  TrackingStatusEntity copyWith({
    int? assignmentId,
    int? bookingId,
    int? workerId,
    bool? isTracking,
    String? status,
    DateTime? trackingStartedAt,
    DateTime? lastLocationUpdate,
    String? workerName,
    String? customerName,
    double? workerLatitude,
    double? workerLongitude,
    double? workerAccuracy,
  }) {
    return TrackingStatusEntity(
      assignmentId: assignmentId ?? this.assignmentId,
      bookingId: bookingId ?? this.bookingId,
      workerId: workerId ?? this.workerId,
      isTracking: isTracking ?? this.isTracking,
      status: status ?? this.status,
      trackingStartedAt: trackingStartedAt ?? this.trackingStartedAt,
      lastLocationUpdate: lastLocationUpdate ?? this.lastLocationUpdate,
      workerName: workerName ?? this.workerName,
      customerName: customerName ?? this.customerName,
      workerLatitude: workerLatitude ?? this.workerLatitude,
      workerLongitude: workerLongitude ?? this.workerLongitude,
      workerAccuracy: workerAccuracy ?? this.workerAccuracy,
    );
  }
}