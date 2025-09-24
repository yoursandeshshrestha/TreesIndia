import '../repositories/conversation_repository.dart';

class GetTotalUnreadCountUseCase {
  final ConversationRepository _repository;

  GetTotalUnreadCountUseCase(this._repository);

  Future<int> execute() async {
    return await _repository.getTotalUnreadCount();
  }
}