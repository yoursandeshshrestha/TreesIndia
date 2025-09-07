import '../repositories/chat_repository.dart';

class MarkMessageReadUseCase {
  final ChatRepository _repository;

  MarkMessageReadUseCase(this._repository);

  Future<void> execute(int messageId) async {
    await _repository.markMessageAsRead(messageId);
  }
}