import '../entities/chat_response_entity.dart';
import '../entities/chat_message_entity.dart';
import '../entities/chat_room_entity.dart';

abstract class ChatRepository {
  Future<ChatRoomsResponseEntity> getChatRooms({
    int page = 1,
    int limit = 20,
  });

  Future<ChatMessagesResponseEntity> getChatMessages(
    int roomId, {
    int page = 1,
    int limit = 50,
  });

  Future<ChatMessageEntity> sendMessage(
    int roomId, {
    required String message,
    String messageType = 'text',
  });

  Future<void> markMessageAsRead(int messageId);

  Future<ChatRoomEntity> getBookingChatRoom(int bookingId);
}