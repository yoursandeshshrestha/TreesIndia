import '../repositories/conversation_repository.dart';

class MarkConversationMessageReadUseCase {
  final ConversationRepository _repository;

  MarkConversationMessageReadUseCase(this._repository);

  Future<void> execute(int messageId) async {
    return await _repository.markMessageAsRead(messageId);
  }
}