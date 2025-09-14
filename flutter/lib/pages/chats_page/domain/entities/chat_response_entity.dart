import 'chat_room_entity.dart';
import 'chat_message_entity.dart';

class ChatRoomsResponseEntity {
  final List<ChatRoomEntity> chatRooms;
  final ChatPaginationEntity pagination;

  const ChatRoomsResponseEntity({
    required this.chatRooms,
    required this.pagination,
  });
}

class ChatMessagesResponseEntity {
  final List<ChatMessageEntity> messages;
  final ChatPaginationEntity pagination;

  const ChatMessagesResponseEntity({
    required this.messages,
    required this.pagination,
  });
}

// class ChatRoomResponseEntity {
//   final ChatRoomEntity chatRoom;

//   const ChatRoomResponseEntity({
//     required this.chatRoom,
//   });
// }

class ChatMessageResponseEntity {
  final ChatMessageEntity message;

  const ChatMessageResponseEntity({
    required this.message,
  });
}

class ChatPaginationEntity {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const ChatPaginationEntity({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });
}
