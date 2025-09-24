import '../../domain/entities/unread_count_entity.dart';

class UnreadCountModel {
  final bool success;
  final String message;
  final int unreadCount;

  UnreadCountModel({
    required this.success,
    required this.message,
    required this.unreadCount,
  });

  factory UnreadCountModel.fromJson(Map<String, dynamic> json) {
    return UnreadCountModel(
      success: json['success'] as bool,
      message: json['message'] as String? ?? '',
      unreadCount: json['unread_count'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'unread_count': unreadCount,
    };
  }

  UnreadCountEntity toEntity() {
    return UnreadCountEntity(
      success: success,
      message: message,
      unreadCount: unreadCount,
    );
  }
}