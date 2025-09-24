import '../entities/conversation_entity.dart';
import '../repositories/conversation_repository.dart';

class GetConversationUseCase {
  final ConversationRepository _repository;

  GetConversationUseCase(this._repository);

  Future<ConversationEntity> execute(int conversationId) async {
    return await _repository.getConversation(conversationId);
  }
}