import 'package:equatable/equatable.dart';

class WorkerLocationEntity extends Equatable {
  final int workerId;
  final int assignmentId;
  final int bookingId;
  final double latitude;
  final double longitude;
  final double accuracy;
  final String status;
  final DateTime lastUpdated;
  final String? workerName;
  final String? customerName;
  final bool hasArrived;

  const WorkerLocationEntity({
    required this.workerId,
    required this.assignmentId,
    required this.bookingId,
    required this.latitude,
    required this.longitude,
    required this.accuracy,
    required this.status,
    required this.lastUpdated,
    this.workerName,
    this.customerName,
    this.hasArrived = false,
  });

  @override
  List<Object?> get props => [
        workerId,
        assignmentId,
        bookingId,
        latitude,
        longitude,
        accuracy,
        status,
        lastUpdated,
        workerName,
        customerName,
        hasArrived,
      ];

  WorkerLocationEntity copyWith({
    int? workerId,
    int? assignmentId,
    int? bookingId,
    double? latitude,
    double? longitude,
    double? accuracy,
    String? status,
    DateTime? lastUpdated,
    String? workerName,
    String? customerName,
    bool? hasArrived,
  }) {
    return WorkerLocationEntity(
      workerId: workerId ?? this.workerId,
      assignmentId: assignmentId ?? this.assignmentId,
      bookingId: bookingId ?? this.bookingId,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      accuracy: accuracy ?? this.accuracy,
      status: status ?? this.status,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      workerName: workerName ?? this.workerName,
      customerName: customerName ?? this.customerName,
      hasArrived: hasArrived ?? this.hasArrived,
    );
  }
}