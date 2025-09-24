import '../../domain/entities/conversation_message_entity.dart';
import 'conversation_model.dart';

class ConversationMessageModel {
  final int id;
  final int conversationId;
  final int senderId;
  final String message;
  final bool isRead;
  final String? readAt;
  final String createdAt;
  final String updatedAt;
  final UserDataModel sender;

  ConversationMessageModel({
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

  factory ConversationMessageModel.fromJson(Map<String, dynamic> json) {
    return ConversationMessageModel(
      id: json['id'] ?? 0,
      conversationId: json['conversation_id'] ?? 0,
      senderId: json['sender_id'] ?? 0,
      message: json['message'] ?? '',
      isRead: json['is_read'] ?? false,
      readAt: json['read_at'],
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
      sender: UserDataModel.fromJson(json['sender'] ?? {}),
    );
  }

  ConversationMessageEntity toEntity() {
    return ConversationMessageEntity(
      id: id,
      conversationId: conversationId,
      senderId: senderId,
      message: message,
      isRead: isRead,
      readAt: readAt,
      createdAt: createdAt,
      updatedAt: updatedAt,
      sender: sender.toEntity(),
    );
  }
}

class ConversationMessagesResponseModel {
  final List<ConversationMessageModel> messages;
  final PaginationModel pagination;

  ConversationMessagesResponseModel({
    required this.messages,
    required this.pagination,
  });

  factory ConversationMessagesResponseModel.fromJson(Map<String, dynamic> json) {
    return ConversationMessagesResponseModel(
      messages: (json['messages'] as List<dynamic>? ?? [])
          .map((message) => ConversationMessageModel.fromJson(message))
          .toList(),
      pagination: PaginationModel.fromJson(json['pagination'] ?? {}),
    );
  }
}

class SendConversationMessageRequestModel {
  final String message;

  SendConversationMessageRequestModel({
    required this.message,
  });

  Map<String, dynamic> toJson() {
    return {
      'message': message,
    };
  }
}