import '../../domain/entities/conversation_entity.dart';

enum ConversationsStatus {
  initial,
  loading,
  loaded,
  refreshing,
  loadingMore,
  error,
}

class ConversationsState {
  final ConversationsStatus status;
  final List<ConversationEntity> conversations;
  final String? errorMessage;
  final bool hasMoreConversations;
  final int currentPage;
  final int totalConversations;

  const ConversationsState({
    this.status = ConversationsStatus.initial,
    this.conversations = const [],
    this.errorMessage,
    this.hasMoreConversations = true,
    this.currentPage = 1,
    this.totalConversations = 0,
  });

  ConversationsState copyWith({
    ConversationsStatus? status,
    List<ConversationEntity>? conversations,
    String? errorMessage,
    bool? hasMoreConversations,
    int? currentPage,
    int? totalConversations,
  }) {
    return ConversationsState(
      status: status ?? this.status,
      conversations: conversations ?? this.conversations,
      errorMessage: errorMessage,
      hasMoreConversations: hasMoreConversations ?? this.hasMoreConversations,
      currentPage: currentPage ?? this.currentPage,
      totalConversations: totalConversations ?? this.totalConversations,
    );
  }

  ConversationsState clearError() {
    return copyWith(errorMessage: null);
  }

  @override
  String toString() {
    return 'ConversationsState(status: $status, conversations: ${conversations.length}, errorMessage: $errorMessage, hasMoreConversations: $hasMoreConversations, currentPage: $currentPage, totalConversations: $totalConversations)';
  }
}