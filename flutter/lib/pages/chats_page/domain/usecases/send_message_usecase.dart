import '../entities/chat_message_entity.dart';
import '../repositories/chat_repository.dart';

class SendMessageUseCase {
  final ChatRepository _repository;

  SendMessageUseCase(this._repository);

  Future<ChatMessageEntity> execute(
    int roomId, {
    required String message,
    String messageType = 'text',
  }) async {
    return await _repository.sendMessage(
      roomId,
      message: message,
      messageType: messageType,
    );
  }
}