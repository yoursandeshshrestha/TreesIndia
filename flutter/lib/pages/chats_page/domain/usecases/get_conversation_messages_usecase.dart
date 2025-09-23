import '../entities/conversation_message_entity.dart';
import '../repositories/conversation_repository.dart';

class GetConversationMessagesUseCase {
  final ConversationRepository _repository;

  GetConversationMessagesUseCase(this._repository);

  Future<ConversationMessagesResponseEntity> execute(
    int conversationId, {
    int page = 1,
    int limit = 50,
  }) async {
    return await _repository.getConversationMessages(
      conversationId,
      page: page,
      limit: limit,
    );
  }
}