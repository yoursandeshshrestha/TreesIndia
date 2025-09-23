import '../repositories/conversation_repository.dart';

class MarkConversationAsReadUseCase {
  final ConversationRepository _repository;

  MarkConversationAsReadUseCase(this._repository);

  Future<void> execute(int conversationId) async {
    return await _repository.markConversationAsRead(conversationId);
  }
}