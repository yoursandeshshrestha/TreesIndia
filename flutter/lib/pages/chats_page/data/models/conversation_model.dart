import '../../domain/entities/conversation_entity.dart';
import 'conversation_message_model.dart';

class UserDataModel {
  final int id;
  final String name;
  final String userType;
  final String? avatar;
  final String? phone;

  UserDataModel({
    required this.id,
    required this.name,
    required this.userType,
    this.avatar,
    this.phone,
  });

  factory UserDataModel.fromJson(Map<String, dynamic> json) {
    return UserDataModel(
      id: json['ID'] ?? json['id'] ?? 0,
      name: json['name'] ?? '',
      userType: json['user_type'] ?? '',
      avatar: json['avatar'],
      phone: json['phone'],
    );
  }

  UserDataEntity toEntity() {
    return UserDataEntity(
      id: id,
      name: name,
      userType: userType,
      avatar: avatar,
      phone: phone,
    );
  }
}

class ConversationModel {
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
  final UserDataModel user1Data;
  final UserDataModel user2Data;
  final int unreadCount;
  final ConversationMessageModel? lastMessage;

  ConversationModel({
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

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    return ConversationModel(
      id: json['id'] ?? 0,
      user1: json['user_1'] ?? 0,
      user2: json['user_2'] ?? 0,
      isActive: json['is_active'] ?? true,
      lastMessageAt: json['last_message_at'],
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
      lastMessageId: json['last_message_id'],
      lastMessageText: json['last_message_text'],
      lastMessageCreatedAt: json['last_message_created_at'],
      lastMessageSenderId: json['last_message_sender_id'],
      user1Data: UserDataModel.fromJson(json['user_1_data'] ?? {}),
      user2Data: UserDataModel.fromJson(json['user_2_data'] ?? {}),
      unreadCount: json['unread_count'] ?? 0,
      lastMessage: json['last_message'] != null
          ? ConversationMessageModel.fromJson(json['last_message'])
          : null,
    );
  }

  ConversationEntity toEntity() {
    return ConversationEntity(
      id: id,
      user1: user1,
      user2: user2,
      isActive: isActive,
      lastMessageAt: lastMessageAt,
      createdAt: createdAt,
      updatedAt: updatedAt,
      lastMessageId: lastMessageId,
      lastMessageText: lastMessageText,
      lastMessageCreatedAt: lastMessageCreatedAt,
      lastMessageSenderId: lastMessageSenderId,
      user1Data: user1Data.toEntity(),
      user2Data: user2Data.toEntity(),
      unreadCount: unreadCount,
      lastMessage: lastMessage?.toEntity(),
    );
  }
}

class ConversationsResponseModel {
  final List<ConversationModel> conversations;
  final PaginationModel pagination;

  ConversationsResponseModel({
    required this.conversations,
    required this.pagination,
  });

  factory ConversationsResponseModel.fromJson(Map<String, dynamic> json) {
    return ConversationsResponseModel(
      conversations: (json['conversations'] as List<dynamic>? ?? [])
          .map((conversation) => ConversationModel.fromJson(conversation))
          .toList(),
      pagination: PaginationModel.fromJson(json['pagination'] ?? {}),
    );
  }
}

class PaginationModel {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  PaginationModel({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory PaginationModel.fromJson(Map<String, dynamic> json) {
    return PaginationModel(
      page: json['page'] ?? 1,
      limit: json['limit'] ?? 20,
      total: json['total'] ?? 0,
      totalPages: json['total_pages'] ?? 0,
    );
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

class CreateConversationRequestModel {
  final int user1;
  final int user2;

  CreateConversationRequestModel({
    required this.user1,
    required this.user2,
  });

  Map<String, dynamic> toJson() {
    return {
      'user_1': user1,
      'user_2': user2,
    };
  }
}