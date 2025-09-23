import '../entities/conversation_message_entity.dart';
import '../repositories/conversation_repository.dart';

class SendConversationMessageUseCase {
  final ConversationRepository _repository;

  SendConversationMessageUseCase(this._repository);

  Future<ConversationMessageEntity> execute(
    int conversationId, {
    required String message,
  }) async {
    return await _repository.sendMessage(
      conversationId,
      message: message,
    );
  }
}