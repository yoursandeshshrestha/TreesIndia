import '../../../../commons/services/conversation_websocket_service.dart';
import '../../domain/entities/conversation_message_entity.dart';

enum ConversationStatus {
  initial,
  loading,
  loaded,
  refreshing,
  loadingMessages,
  sendingMessage,
  error,
}

class ConversationState {
  final int conversationId;
  final ConversationStatus status;
  final List<ConversationMessageEntity> messages;
  final String? errorMessage;
  final bool hasMoreMessages;
  final int currentPage;
  final bool isSending;
  final ConversationWebSocketConnectionStatus webSocketStatus;

  const ConversationState({
    required this.conversationId,
    this.status = ConversationStatus.initial,
    this.messages = const [],
    this.errorMessage,
    this.hasMoreMessages = true,
    this.currentPage = 1,
    this.isSending = false,
    this.webSocketStatus = ConversationWebSocketConnectionStatus.disconnected,
  });

  ConversationState copyWith({
    int? conversationId,
    ConversationStatus? status,
    List<ConversationMessageEntity>? messages,
    String? errorMessage,
    bool? hasMoreMessages,
    int? currentPage,
    bool? isSending,
    ConversationWebSocketConnectionStatus? webSocketStatus,
  }) {
    return ConversationState(
      conversationId: conversationId ?? this.conversationId,
      status: status ?? this.status,
      messages: messages ?? this.messages,
      errorMessage: errorMessage,
      hasMoreMessages: hasMoreMessages ?? this.hasMoreMessages,
      currentPage: currentPage ?? this.currentPage,
      isSending: isSending ?? this.isSending,
      webSocketStatus: webSocketStatus ?? this.webSocketStatus,
    );
  }

  ConversationState clearError() {
    return copyWith(errorMessage: null);
  }

  @override
  String toString() {
    return 'ConversationState(conversationId: $conversationId, status: $status, messages: ${messages.length}, errorMessage: $errorMessage, hasMoreMessages: $hasMoreMessages, currentPage: $currentPage, isSending: $isSending, webSocketStatus: $webSocketStatus)';
  }
}