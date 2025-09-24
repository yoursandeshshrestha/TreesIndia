import '../entities/conversation_entity.dart';
import '../repositories/conversation_repository.dart';

class CreateConversationUseCase {
  final ConversationRepository _repository;

  CreateConversationUseCase(this._repository);

  Future<ConversationEntity> execute({
    required int user1,
    required int user2,
  }) async {
    return await _repository.createConversation(
      user1: user1,
      user2: user2,
    );
  }
}