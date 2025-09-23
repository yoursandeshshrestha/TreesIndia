import 'conversation_entity.dart';

class ConversationMessageEntity {
  final int id;
  final int conversationId;
  final int senderId;
  final String message;
  final bool isRead;
  final String? readAt;
  final String createdAt;
  final String updatedAt;
  final UserDataEntity sender;

  ConversationMessageEntity({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.message,
    required this.isRead,
    this.readAt,
    required this.createdAt,
    required this.updatedAt,
    required this.sender,
  });

  ConversationMessageEntity copyWith({
    int? id,
    int? conversationId,
    int? senderId,
    String? message,
    bool? isRead,
    String? readAt,
    String? createdAt,
    String? updatedAt,
    UserDataEntity? sender,
  }) {
    return ConversationMessageEntity(
      id: id ?? this.id,
      conversationId: conversationId ?? this.conversationId,
      senderId: senderId ?? this.senderId,
      message: message ?? this.message,
      isRead: isRead ?? this.isRead,
      readAt: readAt ?? this.readAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      sender: sender ?? this.sender,
    );
  }
}

class ConversationMessagesResponseEntity {
  final List<ConversationMessageEntity> messages;
  final PaginationEntity pagination;

  ConversationMessagesResponseEntity({
    required this.messages,
    required this.pagination,
  });
}