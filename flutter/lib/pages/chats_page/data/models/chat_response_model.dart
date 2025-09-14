import '../../domain/entities/chat_response_entity.dart';
import 'chat_room_model.dart';
import 'chat_message_model.dart';

class ChatRoomsResponseModel {
  final List<ChatRoomModel> chatRooms;
  final ChatPaginationModel pagination;

  ChatRoomsResponseModel({
    required this.chatRooms,
    required this.pagination,
  });

  factory ChatRoomsResponseModel.fromJson(Map<String, dynamic> json) {
    return ChatRoomsResponseModel(
      chatRooms: (json['chat_rooms'] as List? ?? [])
          .map((room) => ChatRoomModel.fromJson(room))
          .toList(),
      pagination: ChatPaginationModel.fromJson(json['pagination'] ?? {}),
    );
  }

  ChatRoomsResponseEntity toEntity() {
    return ChatRoomsResponseEntity(
      chatRooms: chatRooms.map((room) => room.toEntity()).toList(),
      pagination: pagination.toEntity(),
    );
  }
}

class ChatMessagesResponseModel {
  final List<ChatMessageModel> messages;
  final ChatPaginationModel pagination;

  ChatMessagesResponseModel({
    required this.messages,
    required this.pagination,
  });

  factory ChatMessagesResponseModel.fromJson(Map<String, dynamic> json) {
    return ChatMessagesResponseModel(
      messages: (json['messages'] as List? ?? [])
          .map((message) => ChatMessageModel.fromJson(message))
          .toList(),
      pagination: ChatPaginationModel.fromJson(json['pagination'] ?? {}),
    );
  }

  ChatMessagesResponseEntity toEntity() {
    return ChatMessagesResponseEntity(
      messages: messages.map((message) => message.toEntity()).toList(),
      pagination: pagination.toEntity(),
    );
  }
}

// class ChatRoomResponseModel {
//   final ChatRoomModel chatRoom;

//   ChatRoomResponseModel({
//     required this.chatRoom,
//   });

//   factory ChatRoomResponseModel.fromJson(Map<String, dynamic> json) {
//     return ChatRoomResponseModel(
//       chatRoom: ChatRoomModel.fromJson(json['chat_room'] ?? {}),
//     );
//   }

//   ChatRoomResponseEntity toEntity() {
//     return ChatRoomResponseEntity(
//       chatRoom: chatRoom.toEntity(),
//     );
//   }
// }

class ChatMessageResponseModel {
  final ChatMessageModel message;

  ChatMessageResponseModel({
    required this.message,
  });

  factory ChatMessageResponseModel.fromJson(Map<String, dynamic> json) {
    return ChatMessageResponseModel(
      message: ChatMessageModel.fromJson(json['message'] ?? {}),
    );
  }

  ChatMessageResponseEntity toEntity() {
    return ChatMessageResponseEntity(
      message: message.toEntity(),
    );
  }
}

class ChatPaginationModel {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  ChatPaginationModel({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory ChatPaginationModel.fromJson(Map<String, dynamic> json) {
    return ChatPaginationModel(
      page: json['page'] ?? 1,
      limit: json['limit'] ?? 20,
      total: json['total'] ?? 0,
      totalPages: json['total_pages'] ?? 0,
    );
  }

  ChatPaginationEntity toEntity() {
    return ChatPaginationEntity(
      page: page,
      limit: limit,
      total: total,
      totalPages: totalPages,
    );
  }
}
