import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/pages/chats_page/domain/entities/conversation_entity.dart';
import '../../../../commons/services/conversation_websocket_service.dart';
import '../../../../commons/app/auth_provider.dart';
import '../../domain/usecases/get_conversations_usecase.dart';
import '../../domain/usecases/mark_conversation_as_read_usecase.dart';
import 'conversations_state.dart';

class ConversationsNotifier extends StateNotifier<ConversationsState> {
  final GetConversationsUseCase _getConversationsUseCase;
  final MarkConversationAsReadUseCase _markConversationAsReadUseCase;
  final ConversationWebSocketService _conversationWebSocketService;
  final AuthNotifier _authNotifier;

  StreamSubscription<ConversationWebSocketMessage>? _messageSubscription;
  StreamSubscription<ConversationWebSocketConnectionStatus>?
      _statusSubscription;
  Timer? _autoRefreshTimer;
  bool _mounted = true;

  static const int _pageLimit = 20;
  static const Duration _autoRefreshInterval = Duration(seconds: 30);

  ConversationsNotifier({
    required GetConversationsUseCase getConversationsUseCase,
    required MarkConversationAsReadUseCase markConversationAsReadUseCase,
    required ConversationWebSocketService conversationWebSocketService,
    required AuthNotifier authNotifier,
  })  : _getConversationsUseCase = getConversationsUseCase,
        _markConversationAsReadUseCase = markConversationAsReadUseCase,
        _conversationWebSocketService = conversationWebSocketService,
        _authNotifier = authNotifier,
        super(const ConversationsState()) {
    _initialize();
  }

  void _initialize() {
    _connectWebSocket();
    _setupWebSocketListeners();
  }

  void _connectWebSocket() {
    final authState = _authNotifier.state;
    if (authState.token?.token != null) {
      _conversationWebSocketService.connect(token: authState.token!.token);
    }
  }

  void _setupWebSocketListeners() {
    _messageSubscription = _conversationWebSocketService.messageStream.listen(
      _handleWebSocketMessage,
      onError: (error) {
        debugPrint('WebSocket message stream error: $error');
      },
    );

    _statusSubscription = _conversationWebSocketService.statusStream.listen(
      _handleWebSocketStatus,
      onError: (error) {
        debugPrint('WebSocket status stream error: $error');
      },
    );
  }

  void _handleWebSocketMessage(ConversationWebSocketMessage message) {
    if (!_mounted) return;

    switch (message.type) {
      case 'new_message':
        // Refresh conversations list to get updated last message
        if (state.status == ConversationsStatus.loaded) {
          refreshConversations();
        }
        break;
      case 'conversation_read':
        // Update the specific conversation as read
        if (message.conversationId != null) {
          _updateConversationReadStatus(message.conversationId!);
        }
        break;
    }
  }

  void _handleWebSocketStatus(ConversationWebSocketConnectionStatus status) {
    if (!_mounted) return;

    // Reload conversations when reconnected
    if (status == ConversationWebSocketConnectionStatus.connected &&
        state.conversations.isNotEmpty) {
      refreshConversations();
    }
  }

  void _updateConversationReadStatus(int conversationId) {
    final updatedConversations = state.conversations.map((conversation) {
      if (conversation.id == conversationId) {
        return ConversationEntity(
          id: conversation.id,
          user1: conversation.user1,
          user2: conversation.user2,
          isActive: conversation.isActive,
          lastMessageAt: conversation.lastMessageAt,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          lastMessageId: conversation.lastMessageId,
          lastMessageText: conversation.lastMessageText,
          lastMessageCreatedAt: conversation.lastMessageCreatedAt,
          lastMessageSenderId: conversation.lastMessageSenderId,
          user1Data: conversation.user1Data,
          user2Data: conversation.user2Data,
          unreadCount: 0, // Mark as read
          lastMessage: conversation.lastMessage,
        );
      }
      return conversation;
    }).toList();

    state = state.copyWith(conversations: updatedConversations);
  }

  Future<void> loadConversations({bool refresh = false}) async {
    if (!_mounted) return;

    try {
      if (refresh || state.status == ConversationsStatus.initial) {
        state = state.copyWith(
          status: refresh
              ? ConversationsStatus.refreshing
              : ConversationsStatus.loading,
          errorMessage: null,
        );
      }

      final response = await _getConversationsUseCase.execute(
        page: refresh ? 1 : state.currentPage,
        limit: _pageLimit,
      );

      if (!_mounted) return;

      final newConversations = refresh
          ? response.conversations
          : [...state.conversations, ...response.conversations];

      state = state.copyWith(
        status: ConversationsStatus.loaded,
        conversations: newConversations,
        currentPage: refresh ? 1 : state.currentPage,
        hasMoreConversations: response.conversations.length == _pageLimit,
        totalConversations: response.pagination.total,
        errorMessage: null,
      );
    } catch (e) {
      if (!_mounted) return;
      debugPrint('Error loading conversations: $e');
      state = state.copyWith(
        status: ConversationsStatus.error,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> refreshConversations() async {
    await loadConversations(refresh: true);
  }

  Future<void> loadMoreConversations() async {
    if (state.status == ConversationsStatus.loadingMore ||
        !state.hasMoreConversations) {
      return;
    }

    if (!_mounted) return;

    try {
      state = state.copyWith(status: ConversationsStatus.loadingMore);

      final response = await _getConversationsUseCase.execute(
        page: state.currentPage + 1,
        limit: _pageLimit,
      );

      if (!_mounted) return;

      state = state.copyWith(
        status: ConversationsStatus.loaded,
        conversations: [...state.conversations, ...response.conversations],
        currentPage: state.currentPage + 1,
        hasMoreConversations: response.conversations.length == _pageLimit,
        totalConversations: response.pagination.total,
      );
    } catch (e) {
      if (!_mounted) return;
      debugPrint('Error loading more conversations: $e');
      state = state.copyWith(
        status: ConversationsStatus.loaded,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> markConversationAsRead(int conversationId) async {
    try {
      await _markConversationAsReadUseCase.execute(conversationId);
      _updateConversationReadStatus(conversationId);
    } catch (e) {
      debugPrint('Error marking conversation as read: $e');
    }
  }

  void startAutoRefresh() {
    _autoRefreshTimer?.cancel();
    _autoRefreshTimer = Timer.periodic(_autoRefreshInterval, (_) {
      if (_mounted && state.status == ConversationsStatus.loaded) {
        refreshConversations();
      }
    });
  }

  void stopAutoRefresh() {
    _autoRefreshTimer?.cancel();
    _autoRefreshTimer = null;
  }

  @override
  void dispose() {
    _mounted = false;
    _messageSubscription?.cancel();
    _statusSubscription?.cancel();
    _autoRefreshTimer?.cancel();
    _conversationWebSocketService.dispose();
    super.dispose();
  }
}
