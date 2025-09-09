import '../../domain/entities/worker_location_entity.dart';

class WorkerLocationModel extends WorkerLocationEntity {
  const WorkerLocationModel({
    required super.workerId,
    required super.assignmentId,
    required super.bookingId,
    required super.latitude,
    required super.longitude,
    required super.accuracy,
    required super.status,
    required super.lastUpdated,
    super.workerName,
    super.customerName,
    super.hasArrived,
  });

  factory WorkerLocationModel.fromJson(Map<String, dynamic> json) {
    return WorkerLocationModel(
      workerId: json['worker_id'] ?? 0,
      assignmentId: json['assignment_id'] ?? 0,
      bookingId: json['booking_id'] ?? 0,
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      accuracy: (json['accuracy'] ?? 0.0).toDouble(),
      status: json['status'] ?? 'unknown',
      lastUpdated: DateTime.parse(json['last_updated'] ?? DateTime.now().toIso8601String()),
      workerName: json['worker_name'],
      customerName: json['customer_name'],
      hasArrived: json['has_arrived'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'worker_id': workerId,
      'assignment_id': assignmentId,
      'booking_id': bookingId,
      'latitude': latitude,
      'longitude': longitude,
      'accuracy': accuracy,
      'status': status,
      'last_updated': lastUpdated.toIso8601String(),
      'worker_name': workerName,
      'customer_name': customerName,
      'has_arrived': hasArrived,
    };
  }

  factory WorkerLocationModel.fromEntity(WorkerLocationEntity entity) {
    return WorkerLocationModel(
      workerId: entity.workerId,
      assignmentId: entity.assignmentId,
      bookingId: entity.bookingId,
      latitude: entity.latitude,
      longitude: entity.longitude,
      accuracy: entity.accuracy,
      status: entity.status,
      lastUpdated: entity.lastUpdated,
      workerName: entity.workerName,
      customerName: entity.customerName,
      hasArrived: entity.hasArrived,
    );
  }

  WorkerLocationEntity toEntity() {
    return WorkerLocationEntity(
      workerId: workerId,
      assignmentId: assignmentId,
      bookingId: bookingId,
      latitude: latitude,
      longitude: longitude,
      accuracy: accuracy,
      status: status,
      lastUpdated: lastUpdated,
      workerName: workerName,
      customerName: customerName,
      hasArrived: hasArrived,
    );
  }
}