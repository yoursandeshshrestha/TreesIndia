import '../../domain/entities/conversation_entity.dart';
import '../../domain/entities/conversation_message_entity.dart';
import '../../domain/repositories/conversation_repository.dart';
import '../datasources/conversation_remote_datasource.dart';

class ConversationRepositoryImpl implements ConversationRepository {
  final ConversationRemoteDatasource remoteDatasource;

  ConversationRepositoryImpl({
    required this.remoteDatasource,
  });

  @override
  Future<ConversationsResponseEntity> getConversations({
    int page = 1,
    int limit = 20,
  }) async {
    final responseModel = await remoteDatasource.getConversations(
      page: page,
      limit: limit,
    );
    return ConversationsResponseEntity(
      conversations: responseModel.conversations.map((model) => model.toEntity()).toList(),
      pagination: responseModel.pagination.toEntity(),
    );
  }

  @override
  Future<ConversationEntity> getConversation(int conversationId) async {
    final model = await remoteDatasource.getConversation(conversationId);
    return model.toEntity();
  }

  @override
  Future<ConversationMessagesResponseEntity> getConversationMessages(
    int conversationId, {
    int page = 1,
    int limit = 50,
  }) async {
    final responseModel = await remoteDatasource.getConversationMessages(
      conversationId,
      page: page,
      limit: limit,
    );
    return ConversationMessagesResponseEntity(
      messages: responseModel.messages.map((model) => model.toEntity()).toList(),
      pagination: responseModel.pagination.toEntity(),
    );
  }

  @override
  Future<ConversationEntity> createConversation({
    required int user1,
    required int user2,
  }) async {
    final model = await remoteDatasource.createConversation(
      user1: user1,
      user2: user2,
    );
    return model.toEntity();
  }

  @override
  Future<ConversationMessageEntity> sendMessage(
    int conversationId, {
    required String message,
  }) async {
    final model = await remoteDatasource.sendMessage(
      conversationId,
      message: message,
    );
    return model.toEntity();
  }

  @override
  Future<void> markMessageAsRead(int messageId) async {
    return await remoteDatasource.markMessageAsRead(messageId);
  }

  @override
  Future<void> markConversationAsRead(int conversationId) async {
    return await remoteDatasource.markConversationAsRead(conversationId);
  }

  @override
  Future<int> getConversationUnreadCount(int conversationId) async {
    final response = await remoteDatasource.getConversationUnreadCount(conversationId);
    return response['unread_count'] ?? 0;
  }

  @override
  Future<int> getTotalUnreadCount() async {
    final response = await remoteDatasource.getTotalUnreadCount();
    return response['total_unread_count'] ?? 0;
  }
}