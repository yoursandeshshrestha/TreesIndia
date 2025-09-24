import '../../../../commons/data/models/user_model.dart';
import '../../domain/entities/worker_assignment_entity.dart';

class WorkerAssignmentModel extends WorkerAssignmentEntity {
  const WorkerAssignmentModel({
    super.id,
    super.bookingId,
    required super.workerId,
    super.assignedBy,
    super.status,
    super.assignedAt,
    super.acceptedAt,
    super.rejectedAt,
    super.startedAt,
    super.completedAt,
    super.assignmentNotes,
    super.acceptanceNotes,
    super.rejectionNotes,
    super.rejectionReason,
    super.worker,
    super.assignedByUser,
  });

  factory WorkerAssignmentModel.fromJson(Map<String, dynamic> json) {
    return WorkerAssignmentModel(
      id: json['ID'] as int? ?? 0,
      bookingId: json['booking_id'] as int?,
      workerId: json['worker_id'] as int,
      assignedBy: json['assigned_by'] as int?,
      status: json['status'] as String?,
      assignedAt: json['assigned_at'] != null
          ? DateTime.parse(json['assigned_at'] as String? ?? '')
          : null,
      acceptedAt: json['accepted_at'] != null
          ? DateTime.parse(json['accepted_at'] as String)
          : null,
      rejectedAt: json['rejected_at'] != null
          ? DateTime.parse(json['rejected_at'] as String)
          : null,
      startedAt: json['started_at'] != null
          ? DateTime.parse(json['started_at'] as String)
          : null,
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'] as String)
          : null,
      assignmentNotes: json['assignment_notes'] as String? ?? '',
      acceptanceNotes: json['acceptance_notes'] as String? ?? '',
      rejectionNotes: json['rejection_notes'] as String? ?? '',
      rejectionReason: json['rejection_reason'] as String? ?? '',
      worker: json['worker'] != null
          ? UserModel.fromJson(json['worker'] as Map<String, dynamic>)
              .toEntity()
          : null,
      assignedByUser: json['assigned_by_user'] != null
          ? UserModel.fromJson(json['assigned_by_user'] as Map<String, dynamic>)
              .toEntity()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ID': id,
      'booking_id': bookingId,
      'worker_id': workerId,
      'assigned_by': assignedBy,
      'status': status,
      'assigned_at': assignedAt?.toIso8601String(),
      'accepted_at': acceptedAt?.toIso8601String(),
      'rejected_at': rejectedAt?.toIso8601String(),
      'started_at': startedAt?.toIso8601String(),
      'completed_at': completedAt?.toIso8601String(),
      'assignment_notes': assignmentNotes,
      'acceptance_notes': acceptanceNotes,
      'rejection_notes': rejectionNotes,
      'rejection_reason': rejectionReason,
    };
  }

  WorkerAssignmentEntity toEntity() {
    return WorkerAssignmentEntity(
      id: id,
      bookingId: bookingId,
      workerId: workerId,
      assignedBy: assignedBy,
      status: status,
      assignedAt: assignedAt,
      acceptedAt: acceptedAt,
      rejectedAt: rejectedAt,
      startedAt: startedAt,
      completedAt: completedAt,
      assignmentNotes: assignmentNotes,
      acceptanceNotes: acceptanceNotes,
      rejectionNotes: rejectionNotes,
      rejectionReason: rejectionReason,
      worker: worker,
      assignedByUser: assignedByUser,
    );
  }

  factory WorkerAssignmentModel.fromEntity(WorkerAssignmentEntity entity) {
    return WorkerAssignmentModel(
      id: entity.id,
      bookingId: entity.bookingId,
      workerId: entity.workerId,
      assignedBy: entity.assignedBy,
      status: entity.status,
      assignedAt: entity.assignedAt,
      acceptedAt: entity.acceptedAt,
      rejectedAt: entity.rejectedAt,
      startedAt: entity.startedAt,
      completedAt: entity.completedAt,
      assignmentNotes: entity.assignmentNotes,
      acceptanceNotes: entity.acceptanceNotes,
      rejectionNotes: entity.rejectionNotes,
      rejectionReason: entity.rejectionReason,
      worker: entity.worker,
      assignedByUser: entity.assignedByUser,
    );
  }
}
