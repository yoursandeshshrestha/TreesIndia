import '../entities/chat_response_entity.dart';
import '../repositories/chat_repository.dart';

class GetChatRoomsUseCase {
  final ChatRepository _repository;

  GetChatRoomsUseCase(this._repository);

  Future<ChatRoomsResponseEntity> execute({
    int page = 1,
    int limit = 20,
  }) async {
    return await _repository.getChatRooms(
      page: page,
      limit: limit,
    );
  }
}