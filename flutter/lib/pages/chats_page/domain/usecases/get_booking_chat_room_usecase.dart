import '../entities/chat_room_entity.dart';
import '../repositories/chat_repository.dart';

class GetBookingChatRoomUseCase {
  final ChatRepository _repository;

  GetBookingChatRoomUseCase(this._repository);

  Future<ChatRoomEntity> execute(int bookingId) async {
    return await _repository.getBookingChatRoom(bookingId);
  }
}