import 'package:equatable/equatable.dart';

class NotificationEntity extends Equatable {
  final int id;
  final String type;
  final String title;
  final String message;
  final bool isRead;
  final String? readAt;
  final String? relatedEntityType;
  final int? relatedEntityId;
  final Map<String, dynamic>? data;
  final DateTime createdAt;
  final DateTime updatedAt;

  const NotificationEntity({
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

  NotificationEntity copyWith({
    int? id,
    String? type,
    String? title,
    String? message,
    bool? isRead,
    String? readAt,
    String? relatedEntityType,
    int? relatedEntityId,
    Map<String, dynamic>? data,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return NotificationEntity(
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

  @override
  List<Object?> get props => [
        id,
        type,
        title,
        message,
        isRead,
        readAt,
        relatedEntityType,
        relatedEntityId,
        data,
        createdAt,
        updatedAt,
      ];
}