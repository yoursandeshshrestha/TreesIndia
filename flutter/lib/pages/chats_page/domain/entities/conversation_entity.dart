import 'conversation_message_entity.dart';

class UserDataEntity {
  final int id;
  final String name;
  final String userType;
  final String? avatar;
  final String? phone;

  UserDataEntity({
    required this.id,
    required this.name,
    required this.userType,
    this.avatar,
    this.phone,
  });
}

class ConversationEntity {
  final int id;
  final int user1;
  final int user2;
  final bool isActive;
  final String? lastMessageAt;
  final String createdAt;
  final String updatedAt;
  final int? lastMessageId;
  final String? lastMessageText;
  final String? lastMessageCreatedAt;
  final int? lastMessageSenderId;
  final UserDataEntity user1Data;
  final UserDataEntity user2Data;
  final int unreadCount;
  final ConversationMessageEntity? lastMessage;

  ConversationEntity({
    required this.id,
    required this.user1,
    required this.user2,
    required this.isActive,
    this.lastMessageAt,
    required this.createdAt,
    required this.updatedAt,
    this.lastMessageId,
    this.lastMessageText,
    this.lastMessageCreatedAt,
    this.lastMessageSenderId,
    required this.user1Data,
    required this.user2Data,
    this.unreadCount = 0,
    this.lastMessage,
  });

  ConversationEntity copyWith({
    int? id,
    int? user1,
    int? user2,
    bool? isActive,
    String? lastMessageAt,
    String? createdAt,
    String? updatedAt,
    int? lastMessageId,
    String? lastMessageText,
    String? lastMessageCreatedAt,
    int? lastMessageSenderId,
    UserDataEntity? user1Data,
    UserDataEntity? user2Data,
    int? unreadCount,
    ConversationMessageEntity? lastMessage,
  }) {
    return ConversationEntity(
      id: id ?? this.id,
      user1: user1 ?? this.user1,
      user2: user2 ?? this.user2,
      isActive: isActive ?? this.isActive,
      lastMessageAt: lastMessageAt ?? this.lastMessageAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      lastMessageId: lastMessageId ?? this.lastMessageId,
      lastMessageText: lastMessageText ?? this.lastMessageText,
      lastMessageCreatedAt: lastMessageCreatedAt ?? this.lastMessageCreatedAt,
      lastMessageSenderId: lastMessageSenderId ?? this.lastMessageSenderId,
      user1Data: user1Data ?? this.user1Data,
      user2Data: user2Data ?? this.user2Data,
      unreadCount: unreadCount ?? this.unreadCount,
      lastMessage: lastMessage ?? this.lastMessage,
    );
  }
}

class ConversationsResponseEntity {
  final List<ConversationEntity> conversations;
  final PaginationEntity pagination;

  ConversationsResponseEntity({
    required this.conversations,
    required this.pagination,
  });
}

class PaginationEntity {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  PaginationEntity({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });
}