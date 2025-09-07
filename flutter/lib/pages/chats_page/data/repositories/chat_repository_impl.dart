import '../../domain/entities/chat_response_entity.dart';
import '../../domain/entities/chat_message_entity.dart';
import '../../domain/entities/chat_room_entity.dart';
import '../../domain/repositories/chat_repository.dart';
import '../datasources/chat_remote_datasource.dart';

class ChatRepositoryImpl implements ChatRepository {
  final ChatRemoteDatasource _remoteDatasource;

  ChatRepositoryImpl(this._remoteDatasource);

  @override
  Future<ChatRoomsResponseEntity> getChatRooms({
    int page = 1,
    int limit = 20,
  }) async {
    final responseModel = await _remoteDatasource.getChatRooms(
      page: page,
      limit: limit,
    );
    return responseModel.toEntity();
  }

  @override
  Future<ChatMessagesResponseEntity> getChatMessages(
    int roomId, {
    int page = 1,
    int limit = 50,
  }) async {
    final responseModel = await _remoteDatasource.getChatMessages(
      roomId,
      page: page,
      limit: limit,
    );
    return responseModel.toEntity();
  }

  @override
  Future<ChatMessageEntity> sendMessage(
    int roomId, {
    required String message,
    String messageType = 'text',
  }) async {
    final messageModel = await _remoteDatasource.sendMessage(
      roomId,
      message: message,
      messageType: messageType,
    );
    return messageModel.toEntity();
  }

  @override
  Future<void> markMessageAsRead(int messageId) async {
    await _remoteDatasource.markMessageAsRead(messageId);
  }

  @override
  Future<ChatRoomEntity> getBookingChatRoom(int bookingId) async {
    final roomModel = await _remoteDatasource.getBookingChatRoom(bookingId);
    return roomModel.toEntity();
  }
}