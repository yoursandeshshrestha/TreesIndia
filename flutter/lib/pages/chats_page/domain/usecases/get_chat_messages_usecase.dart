import '../entities/chat_response_entity.dart';
import '../repositories/chat_repository.dart';

class GetChatMessagesUseCase {
  final ChatRepository _repository;

  GetChatMessagesUseCase(this._repository);

  Future<ChatMessagesResponseEntity> execute(
    int roomId, {
    int page = 1,
    int limit = 50,
  }) async {
    return await _repository.getChatMessages(
      roomId,
      page: page,
      limit: limit,
    );
  }
}