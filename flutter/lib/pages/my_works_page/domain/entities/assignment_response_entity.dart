import 'package:equatable/equatable.dart';
import 'assignment_entity.dart';

class PaginationEntity extends Equatable {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const PaginationEntity({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  @override
  List<Object?> get props => [page, limit, total, totalPages];
}

class AssignmentResponseEntity extends Equatable {
  final bool success;
  final String message;
  final List<AssignmentEntity> assignments;
  final PaginationEntity pagination;
  final String timestamp;

  const AssignmentResponseEntity({
    required this.success,
    required this.message,
    required this.assignments,
    required this.pagination,
    required this.timestamp,
  });

  @override
  List<Object?> get props => [success, message, assignments, pagination, timestamp];
}