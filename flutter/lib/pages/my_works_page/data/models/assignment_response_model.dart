import '../../domain/entities/assignment_response_entity.dart';
import 'assignment_model.dart';

class PaginationModel {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const PaginationModel({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory PaginationModel.fromJson(Map<String, dynamic> json) {
    return PaginationModel(
      page: json['page'] as int,
      limit: json['limit'] as int,
      total: json['total'] as int,
      totalPages: json['total_pages'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'page': page,
      'limit': limit,
      'total': total,
      'total_pages': totalPages,
    };
  }

  PaginationEntity toEntity() {
    return PaginationEntity(
      page: page,
      limit: limit,
      total: total,
      totalPages: totalPages,
    );
  }
}

class AssignmentResponseModel {
  final bool success;
  final String message;
  final List<AssignmentModel> assignments;
  final PaginationModel pagination;
  final String timestamp;

  const AssignmentResponseModel({
    required this.success,
    required this.message,
    required this.assignments,
    required this.pagination,
    required this.timestamp,
  });

  factory AssignmentResponseModel.fromJson(Map<String, dynamic> json) {
    final dataJson = json['data'] as Map<String, dynamic>;
    final assignmentsJson = dataJson['assignments'] as List<dynamic>;
    final paginationJson = dataJson['pagination'] as Map<String, dynamic>;

    return AssignmentResponseModel(
      success: json['success'] as bool,
      message: json['message'] as String,
      assignments: assignmentsJson
          .map((assignment) => AssignmentModel.fromJson(assignment as Map<String, dynamic>))
          .toList(),
      pagination: PaginationModel.fromJson(paginationJson),
      timestamp: json['timestamp'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': {
        'assignments': assignments.map((assignment) => assignment.toJson()).toList(),
        'pagination': pagination.toJson(),
      },
      'timestamp': timestamp,
    };
  }

  AssignmentResponseEntity toEntity() {
    return AssignmentResponseEntity(
      success: success,
      message: message,
      assignments: assignments.map((assignment) => assignment.toEntity()).toList(),
      pagination: pagination.toEntity(),
      timestamp: timestamp,
    );
  }
}