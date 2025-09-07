class ChatMessageEntity {
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
  final ChatSenderEntity? sender;

  const ChatMessageEntity({
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
}

class ChatSenderEntity {
  final int id;
  final String name;
  final String avatar;
  final String userType;

  const ChatSenderEntity({
    required this.id,
    required this.name,
    required this.avatar,
    required this.userType,
  });
}