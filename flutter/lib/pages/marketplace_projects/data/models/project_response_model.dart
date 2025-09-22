import 'project_model.dart';

class ProjectResponseModel {
  final bool success;
  final String message;
  final List<ProjectModel> data;
  final String timestamp;

  ProjectResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory ProjectResponseModel.fromJson(Map<String, dynamic> json) {
    return ProjectResponseModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null
          ? (json['data'] as List)
              .map((v) => ProjectModel.fromJson(v))
              .toList()
          : [],
      timestamp: json['timestamp'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data.map((v) => v.toJson()).toList(),
      'timestamp': timestamp,
    };
  }

  @override
  String toString() {
    return 'ProjectResponseModel(success: $success, message: $message, projectCount: ${data.length})';
  }
}