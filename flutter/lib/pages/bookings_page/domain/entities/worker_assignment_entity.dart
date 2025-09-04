import 'package:equatable/equatable.dart';
import '../../../../commons/domain/entities/user_entity.dart';

class WorkerAssignmentEntity extends Equatable {
  final int id;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;
  final int bookingId;
  final int workerId;
  final int assignedBy;
  final String status;
  final DateTime assignedAt;
  final DateTime? acceptedAt;
  final DateTime? rejectedAt;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final String assignmentNotes;
  final String acceptanceNotes;
  final String rejectionNotes;
  final String rejectionReason;
  final UserEntity? worker;
  final UserEntity? assignedByUser;

  const WorkerAssignmentEntity({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.bookingId,
    required this.workerId,
    required this.assignedBy,
    required this.status,
    required this.assignedAt,
    this.acceptedAt,
    this.rejectedAt,
    this.startedAt,
    this.completedAt,
    required this.assignmentNotes,
    required this.acceptanceNotes,
    required this.rejectionNotes,
    required this.rejectionReason,
    this.worker,
    this.assignedByUser,
  });

  @override
  List<Object?> get props => [
        id,
        createdAt,
        updatedAt,
        deletedAt,
        bookingId,
        workerId,
        assignedBy,
        status,
        assignedAt,
        acceptedAt,
        rejectedAt,
        startedAt,
        completedAt,
        assignmentNotes,
        acceptanceNotes,
        rejectionNotes,
        rejectionReason,
        worker,
        assignedByUser,
      ];

  WorkerAssignmentEntity copyWith({
    int? id,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? deletedAt,
    int? bookingId,
    int? workerId,
    int? assignedBy,
    String? status,
    DateTime? assignedAt,
    DateTime? acceptedAt,
    DateTime? rejectedAt,
    DateTime? startedAt,
    DateTime? completedAt,
    String? assignmentNotes,
    String? acceptanceNotes,
    String? rejectionNotes,
    String? rejectionReason,
    UserEntity? worker,
    UserEntity? assignedByUser,
  }) {
    return WorkerAssignmentEntity(
      id: id ?? this.id,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      deletedAt: deletedAt ?? this.deletedAt,
      bookingId: bookingId ?? this.bookingId,
      workerId: workerId ?? this.workerId,
      assignedBy: assignedBy ?? this.assignedBy,
      status: status ?? this.status,
      assignedAt: assignedAt ?? this.assignedAt,
      acceptedAt: acceptedAt ?? this.acceptedAt,
      rejectedAt: rejectedAt ?? this.rejectedAt,
      startedAt: startedAt ?? this.startedAt,
      completedAt: completedAt ?? this.completedAt,
      assignmentNotes: assignmentNotes ?? this.assignmentNotes,
      acceptanceNotes: acceptanceNotes ?? this.acceptanceNotes,
      rejectionNotes: rejectionNotes ?? this.rejectionNotes,
      rejectionReason: rejectionReason ?? this.rejectionReason,
      worker: worker ?? this.worker,
      assignedByUser: assignedByUser ?? this.assignedByUser,
    );
  }
}