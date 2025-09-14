import '../../domain/entities/chat_message_entity.dart';

class ChatMessageModel {
  final int id;
  final int roomId;
  final int senderId;
  final String message;
  final String messageType;
  final bool isRead;
  final String? readAt;
  final List<int> readBy;
  final List<String> attachments;
  final String status;
  final int? replyToMessageId;
  final Map<String, dynamic> metadata;
  final String createdAt;
  final String updatedAt;
  final ChatSenderModel? sender;

  ChatMessageModel({
    required this.id,
    required this.roomId,
    required this.senderId,
    required this.message,
    required this.messageType,
    required this.isRead,
    this.readAt,
    required this.readBy,
    required this.attachments,
    required this.status,
    this.replyToMessageId,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    this.sender,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageModel(
      id: json['id'] ?? 0,
      roomId: json['room_id'] ?? 0,
      senderId: json['sender_id'] ?? 0,
      message: json['message'] ?? '',
      messageType: json['message_type'] ?? 'text',
      isRead: json['is_read'] ?? false,
      readAt: json['read_at'],
      readBy: List<int>.from(json['read_by'] ?? []),
      attachments: List<String>.from(json['attachments'] ?? []),
      status: json['status'] ?? 'sent',
      replyToMessageId: json['reply_to_message_id'],
      metadata: json['metadata'] ?? {},
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
      sender: json['sender'] != null 
          ? ChatSenderModel.fromJson(json['sender'])
          : null,
    );
  }

  ChatMessageEntity toEntity() {
    return ChatMessageEntity(
      id: id,
      roomId: roomId,
      senderId: senderId,
      message: message,
      messageType: messageType,
      isRead: isRead,
      readAt: readAt,
      readBy: readBy,
      attachments: attachments,
      status: status,
      replyToMessageId: replyToMessageId,
      metadata: metadata,
      createdAt: createdAt,
      updatedAt: updatedAt,
      sender: sender?.toEntity(),
    );
  }
}

class ChatSenderModel {
  final int id;
  final String name;
  final String avatar;
  final String userType;

  ChatSenderModel({
    required this.id,
    required this.name,
    required this.avatar,
    required this.userType,
  });

  factory ChatSenderModel.fromJson(Map<String, dynamic> json) {
    return ChatSenderModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      avatar: json['avatar'] ?? '',
      userType: json['user_type'] ?? '',
    );
  }

  ChatSenderEntity toEntity() {
    return ChatSenderEntity(
      id: id,
      name: name,
      avatar: avatar,
      userType: userType,
    );
  }
}