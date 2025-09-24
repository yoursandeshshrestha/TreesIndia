import '../../domain/entities/notification_entity.dart';

class NotificationModel {
  final int id;
  final String type;
  final String title;
  final String message;
  final bool isRead;
  final String? readAt;
  final String? relatedEntityType;
  final int? relatedEntityId;
  final Map<String, dynamic>? data;
  final String createdAt;
  final String updatedAt;

  NotificationModel({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.isRead,
    this.readAt,
    this.relatedEntityType,
    this.relatedEntityId,
    this.data,
    required this.createdAt,
    required this.updatedAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    // Helper function to handle empty strings as null
    String? parseNullableString(dynamic value) {
      if (value == null || value == '') return null;
      return value as String;
    }

    return NotificationModel(
      id: json['id'] as int,
      type: json['type'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      isRead: json['is_read'] as bool,
      readAt: parseNullableString(json['read_at']),
      relatedEntityType: parseNullableString(json['related_entity_type']),
      relatedEntityId: json['related_entity_id'] as int?,
      data: json['data'] as Map<String, dynamic>?,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'title': title,
      'message': message,
      'is_read': isRead,
      'read_at': readAt,
      'related_entity_type': relatedEntityType,
      'related_entity_id': relatedEntityId,
      'data': data,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  NotificationEntity toEntity() {
    return NotificationEntity(
      id: id,
      type: type,
      title: title,
      message: message,
      isRead: isRead,
      readAt: readAt,
      relatedEntityType: relatedEntityType,
      relatedEntityId: relatedEntityId,
      data: data,
      createdAt: DateTime.parse(createdAt),
      updatedAt: DateTime.parse(updatedAt),
    );
  }

  NotificationModel copyWith({
    int? id,
    String? type,
    String? title,
    String? message,
    bool? isRead,
    String? readAt,
    String? relatedEntityType,
    int? relatedEntityId,
    Map<String, dynamic>? data,
    String? createdAt,
    String? updatedAt,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      type: type ?? this.type,
      title: title ?? this.title,
      message: message ?? this.message,
      isRead: isRead ?? this.isRead,
      readAt: readAt ?? this.readAt,
      relatedEntityType: relatedEntityType ?? this.relatedEntityType,
      relatedEntityId: relatedEntityId ?? this.relatedEntityId,
      data: data ?? this.data,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}