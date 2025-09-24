import 'project_model.dart';

class ProjectDetailsResponseModel {
  final bool success;
  final String message;
  final ProjectModel data;
  final String timestamp;

  ProjectDetailsResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.timestamp,
  });

  factory ProjectDetailsResponseModel.fromJson(Map<String, dynamic> json) {
    return ProjectDetailsResponseModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: ProjectModel.fromJson(json['data'] ?? {}),
      timestamp: json['timestamp'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data.toJson(),
      'timestamp': timestamp,
    };
  }

  @override
  String toString() {
    return 'ProjectDetailsResponseModel(success: $success, message: $message, projectId: ${data.id})';
  }
}