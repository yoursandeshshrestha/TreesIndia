import '../../domain/entities/mark_all_read_entity.dart';

class MarkAllReadModel {
  final bool success;
  final String message;

  MarkAllReadModel({
    required this.success,
    required this.message,
  });

  factory MarkAllReadModel.fromJson(Map<String, dynamic> json) {
    return MarkAllReadModel(
      success: json['success'] as bool,
      message: json['message'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
    };
  }

  MarkAllReadEntity toEntity() {
    return MarkAllReadEntity(
      success: success,
      message: message,
    );
  }
}