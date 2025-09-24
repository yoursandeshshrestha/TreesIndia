import '../entities/conversation_entity.dart';
import '../repositories/conversation_repository.dart';

class GetConversationsUseCase {
  final ConversationRepository _repository;

  GetConversationsUseCase(this._repository);

  Future<ConversationsResponseEntity> execute({
    int page = 1,
    int limit = 20,
  }) async {
    return await _repository.getConversations(
      page: page,
      limit: limit,
    );
  }
}