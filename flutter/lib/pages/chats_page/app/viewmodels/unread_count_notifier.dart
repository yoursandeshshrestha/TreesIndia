import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/services/conversation_websocket_service.dart';
import '../../../../commons/app/auth_provider.dart';
import '../../domain/usecases/get_total_unread_count_usecase.dart';
import 'unread_count_state.dart';

class UnreadCountNotifier extends StateNotifier<UnreadCountState> {
  final GetTotalUnreadCountUseCase _getTotalUnreadCountUseCase;
  final ConversationWebSocketService _conversationWebSocketService;
  final AuthNotifier _authNotifier;

  StreamSubscription<ConversationWebSocketMessage>? _messageSubscription;
  StreamSubscription<ConversationWebSocketConnectionStatus>? _statusSubscription;

  UnreadCountNotifier({
    required GetTotalUnreadCountUseCase getTotalUnreadCountUseCase,
    required ConversationWebSocketService conversationWebSocketService,
    required AuthNotifier authNotifier,
  })  : _getTotalUnreadCountUseCase = getTotalUnreadCountUseCase,
        _conversationWebSocketService = conversationWebSocketService,
        _authNotifier = authNotifier,
        super(const UnreadCountState()) {
    _initialize();
  }

  void _initialize() {
    _loadTotalUnreadCount();
    _connectWebSocket();
    _setupWebSocketListeners();
  }

  Future<void> _loadTotalUnreadCount() async {
    try {
      state = state.copyWith(isLoading: true, error: null);
      final count = await _getTotalUnreadCountUseCase.execute();
      state = state.copyWith(
        totalUnreadCount: count,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      debugPrint('Error loading total unread count: $e');
    }
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
    switch (message.type) {
      case 'new_message':
        // Increment unread count for new messages
        state = state.copyWith(
          totalUnreadCount: state.totalUnreadCount + 1,
        );
        break;
      case 'message_read':
        // Decrement unread count when message is read
        state = state.copyWith(
          totalUnreadCount: (state.totalUnreadCount - 1).clamp(0, double.infinity).toInt(),
        );
        break;
      case 'conversation_read':
        // Update unread count when conversation is marked as read
        if (message.unreadCount != null) {
          state = state.copyWith(
            totalUnreadCount: (state.totalUnreadCount - message.unreadCount!).clamp(0, double.infinity).toInt(),
          );
        }
        break;
      case 'unread_count_update':
        // Direct unread count update
        if (message.unreadCount != null) {
          state = state.copyWith(
            totalUnreadCount: message.unreadCount!,
          );
        }
        break;
    }
  }

  void _handleWebSocketStatus(ConversationWebSocketConnectionStatus status) {
    state = state.copyWith(
      isConnected: status == ConversationWebSocketConnectionStatus.connected,
    );

    // Reload count when reconnected
    if (status == ConversationWebSocketConnectionStatus.connected) {
      _loadTotalUnreadCount();
    }
  }

  void refreshUnreadCount() {
    _loadTotalUnreadCount();
  }

  void reconnectWebSocket() {
    _connectWebSocket();
  }

  @override
  void dispose() {
    _messageSubscription?.cancel();
    _statusSubscription?.cancel();
    _conversationWebSocketService.dispose();
    super.dispose();
  }
}