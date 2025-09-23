import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/services/conversation_websocket_service.dart';
import '../../../../commons/app/auth_provider.dart';
import '../../domain/usecases/get_conversation_messages_usecase.dart';
import '../../domain/usecases/send_conversation_message_usecase.dart';
import '../../domain/usecases/mark_conversation_as_read_usecase.dart';
import '../../domain/entities/conversation_message_entity.dart';
import 'conversation_state.dart';

class ConversationNotifier extends StateNotifier<ConversationState> {
  final int conversationId;
  final GetConversationMessagesUseCase _getConversationMessagesUseCase;
  final SendConversationMessageUseCase _sendConversationMessageUseCase;
  final MarkConversationAsReadUseCase _markConversationAsReadUseCase;
  final ConversationWebSocketService _conversationWebSocketService;
  final AuthNotifier _authNotifier;

  StreamSubscription<ConversationWebSocketMessage>? _messageSubscription;
  StreamSubscription<ConversationWebSocketConnectionStatus>? _statusSubscription;
  bool _mounted = true;

  static const int _pageLimit = 50;

  ConversationNotifier({
    required this.conversationId,
    required GetConversationMessagesUseCase getConversationMessagesUseCase,
    required SendConversationMessageUseCase sendConversationMessageUseCase,
    required MarkConversationAsReadUseCase markConversationAsReadUseCase,
    required ConversationWebSocketService conversationWebSocketService,
    required AuthNotifier authNotifier,
  })  : _getConversationMessagesUseCase = getConversationMessagesUseCase,
        _sendConversationMessageUseCase = sendConversationMessageUseCase,
        _markConversationAsReadUseCase = markConversationAsReadUseCase,
        _conversationWebSocketService = conversationWebSocketService,
        _authNotifier = authNotifier,
        super(ConversationState(conversationId: conversationId)) {
    _initialize();
  }

  void _initialize() {
    _connectWebSocket();
    _setupWebSocketListeners();
    loadMessages();
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
        if (message.conversationId == conversationId) {
          // Only refresh if we're not already loading messages to prevent race conditions
          if (state.status != ConversationStatus.loadingMessages &&
              state.status != ConversationStatus.refreshing) {
            refreshMessages();
          }
        }
        break;
      case 'conversation_read':
        if (message.conversationId == conversationId) {
          _markMessagesAsRead();
        }
        break;
    }
  }

  void _handleWebSocketStatus(ConversationWebSocketConnectionStatus status) {
    if (!_mounted) return;

    state = state.copyWith(webSocketStatus: status);

    if (status == ConversationWebSocketConnectionStatus.connected &&
        state.messages.isNotEmpty) {
      refreshMessages();
    }
  }

  void _markMessagesAsRead() {
    final updatedMessages = state.messages.map((message) {
      return message.copyWith(isRead: true);
    }).toList();

    state = state.copyWith(messages: updatedMessages);
  }

  List<ConversationMessageEntity> _mergeMessagesWithoutDuplicates(
      List<ConversationMessageEntity> messages) {
    final Map<int, ConversationMessageEntity> messageMap = {};

    // Add all messages to map, using ID as key to automatically handle duplicates
    for (final message in messages) {
      messageMap[message.id] = message;
    }

    // Return sorted list by creation time (newest first for reverse ListView)
    final sortedMessages = messageMap.values.toList()
      ..sort((a, b) => DateTime.parse(b.createdAt).compareTo(DateTime.parse(a.createdAt)));

    return sortedMessages;
  }

  Future<void> loadMessages({bool refresh = false}) async {
    if (!_mounted) return;

    try {
      if (refresh || state.status == ConversationStatus.initial) {
        state = state.copyWith(
          status: refresh ? ConversationStatus.refreshing : ConversationStatus.loading,
          errorMessage: null,
        );
      } else if (state.status == ConversationStatus.loadingMessages) {
        return;
      }

      state = state.copyWith(status: ConversationStatus.loadingMessages);

      final response = await _getConversationMessagesUseCase.execute(
        conversationId,
        page: refresh ? 1 : state.currentPage,
        limit: _pageLimit,
      );

      if (!_mounted) return;

      final newMessages = refresh
          ? response.messages
          : _mergeMessagesWithoutDuplicates([...response.messages, ...state.messages]);

      state = state.copyWith(
        status: ConversationStatus.loaded,
        messages: newMessages,
        currentPage: refresh ? 1 : state.currentPage + 1,
        hasMoreMessages: response.messages.length == _pageLimit,
        errorMessage: null,
      );
    } catch (e) {
      if (!_mounted) return;
      debugPrint('Error loading messages: $e');
      state = state.copyWith(
        status: ConversationStatus.error,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> refreshMessages() async {
    await loadMessages(refresh: true);
  }

  Future<void> loadMoreMessages() async {
    if (state.status == ConversationStatus.loadingMessages ||
        !state.hasMoreMessages) {
      return;
    }

    await loadMessages();
  }

  Future<void> sendMessage(String text) async {
    if (!_mounted || text.trim().isEmpty) return;

    try {
      state = state.copyWith(
        status: ConversationStatus.sendingMessage,
        isSending: true,
      );

      await _sendConversationMessageUseCase.execute(
        conversationId,
        message: text.trim(),
      );

      if (!_mounted) return;

      state = state.copyWith(
        status: ConversationStatus.loaded,
        isSending: false,
      );

      await refreshMessages();
    } catch (e) {
      if (!_mounted) return;
      debugPrint('Error sending message: $e');
      state = state.copyWith(
        status: ConversationStatus.loaded,
        isSending: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> markAsRead() async {
    try {
      await _markConversationAsReadUseCase.execute(conversationId);
      _markMessagesAsRead();
    } catch (e) {
      debugPrint('Error marking conversation as read: $e');
    }
  }

  @override
  void dispose() {
    _mounted = false;
    _messageSubscription?.cancel();
    _statusSubscription?.cancel();
    super.dispose();
  }
}