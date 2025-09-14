import 'package:trees_india/commons/data/models/user_model.dart';
import 'package:trees_india/pages/bookings_page/data/models/booking_details_model.dart';
import '../../domain/entities/assignment_entity.dart';

class AssignmentModel {
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
  final BookingDetailsModel booking;
  final UserModel worker;
  final UserModel assignedByUser;

  const AssignmentModel({
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
    required this.booking,
    required this.worker,
    required this.assignedByUser,
  });

  factory AssignmentModel.fromJson(Map<String, dynamic> json) {
    return AssignmentModel(
      id: json['ID'] as int,
      createdAt: DateTime.parse(json['CreatedAt'] as String),
      updatedAt: DateTime.parse(json['UpdatedAt'] as String),
      deletedAt: json['DeletedAt'] != null
          ? DateTime.parse(json['DeletedAt'] as String)
          : null,
      bookingId: json['booking_id'] as int,
      workerId: json['worker_id'] as int,
      assignedBy: json['assigned_by'] as int,
      status: json['status'] as String,
      assignedAt: DateTime.parse(json['assigned_at'] as String),
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
      booking: BookingDetailsModel.fromJson(json['booking'] as Map<String, dynamic>),
      worker: UserModel.fromJson(json['worker'] as Map<String, dynamic>),
      assignedByUser: UserModel.fromJson(json['assigned_by_user'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ID': id,
      'CreatedAt': createdAt.toIso8601String(),
      'UpdatedAt': updatedAt.toIso8601String(),
      'DeletedAt': deletedAt?.toIso8601String(),
      'booking_id': bookingId,
      'worker_id': workerId,
      'assigned_by': assignedBy,
      'status': status,
      'assigned_at': assignedAt.toIso8601String(),
      'accepted_at': acceptedAt?.toIso8601String(),
      'rejected_at': rejectedAt?.toIso8601String(),
      'started_at': startedAt?.toIso8601String(),
      'completed_at': completedAt?.toIso8601String(),
      'assignment_notes': assignmentNotes,
      'acceptance_notes': acceptanceNotes,
      'rejection_notes': rejectionNotes,
      'rejection_reason': rejectionReason,
      'booking': booking.toJson(),
      'worker': worker.toJson(),
      'assigned_by_user': assignedByUser.toJson(),
    };
  }

  AssignmentEntity toEntity() {
    return AssignmentEntity(
      id: id,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deletedAt: deletedAt,
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
      booking: booking.toEntity(),
      worker: worker.toEntity(),
      assignedByUser: assignedByUser.toEntity(),
    );
  }
}