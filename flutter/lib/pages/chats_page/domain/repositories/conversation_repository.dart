import '../entities/conversation_entity.dart';
import '../entities/conversation_message_entity.dart';

abstract class ConversationRepository {
  Future<ConversationsResponseEntity> getConversations({
    int page = 1,
    int limit = 20,
  });

  Future<ConversationEntity> getConversation(int conversationId);

  Future<ConversationMessagesResponseEntity> getConversationMessages(
    int conversationId, {
    int page = 1,
    int limit = 50,
  });

  Future<ConversationEntity> createConversation({
    required int user1,
    required int user2,
  });

  Future<ConversationMessageEntity> sendMessage(
    int conversationId, {
    required String message,
  });

  Future<void> markMessageAsRead(int messageId);

  Future<void> markConversationAsRead(int conversationId);

  Future<int> getConversationUnreadCount(int conversationId);

  Future<int> getTotalUnreadCount();
}