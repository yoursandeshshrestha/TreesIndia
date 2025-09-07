import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/services/websocket_service.dart';
import '../../domain/entities/chat_message_entity.dart';
import '../../domain/entities/chat_room_entity.dart';
import '../../domain/usecases/get_chat_messages_usecase.dart';
import '../../domain/usecases/send_message_usecase.dart';
import '../../domain/usecases/mark_message_read_usecase.dart';
import 'chat_room_state.dart';

class ChatRoomNotifier extends StateNotifier<ChatRoomState> {
  final GetChatMessagesUseCase getChatMessagesUseCase;
  final SendMessageUseCase sendMessageUseCase;
  final MarkMessageReadUseCase markMessageReadUseCase;
  final WebSocketService webSocketService;

  StreamSubscription<WebSocketMessage>? _messageSubscription;
  StreamSubscription<WebSocketConnectionStatus>? _statusSubscription;

  ChatRoomNotifier({
    required this.getChatMessagesUseCase,
    required this.sendMessageUseCase,
    required this.markMessageReadUseCase,
    required this.webSocketService,
  }) : super(const ChatRoomState()) {
    _listenToWebSocket();
  }

  void _listenToWebSocket() {
    _messageSubscription =
        webSocketService.messageStream.listen(_onWebSocketMessage);
    _statusSubscription =
        webSocketService.statusStream.listen(_onWebSocketStatusChanged);
  }

  void _onWebSocketMessage(WebSocketMessage wsMessage) {
    if (wsMessage.type == 'message' && wsMessage.data != null) {
      try {
        // Parse the message data and add to messages list
        final messageData = wsMessage.data!;
        final newMessage = ChatMessageEntity(
          id: messageData['id'] ?? 0,
          roomId: messageData['room_id'] ?? 0,
          senderId: messageData['sender_id'] ?? 0,
          message: messageData['message'] ?? '',
          messageType: messageData['message_type'] ?? 'text',
          isRead: messageData['is_read'] ?? false,
          readAt: messageData['read_at'],
          readBy: List<int>.from(messageData['read_by'] ?? []),
          attachments: List<String>.from(messageData['attachments'] ?? []),
          status: messageData['status'] ?? 'sent',
          replyToMessageId: messageData['reply_to_message_id'],
          metadata: messageData['metadata'] ?? {},
          createdAt:
              messageData['created_at'] ?? DateTime.now().toIso8601String(),
          updatedAt:
              messageData['updated_at'] ?? DateTime.now().toIso8601String(),
          sender: messageData['sender'] != null
              ? ChatSenderEntity(
                  id: messageData['sender']['id'] ?? 0,
                  name: messageData['sender']['name'] ?? '',
                  avatar: messageData['sender']['avatar'] ?? '',
                  userType: messageData['sender']['user_type'] ?? '',
                )
              : null,
        );

        // Check if message already exists to prevent duplicates
        final messageExists =
            state.messages.any((msg) => msg.id == newMessage.id);
        if (!messageExists) {
          // Add message to the beginning of the list (newest first)
          final updatedMessages = [newMessage, ...state.messages];
          state = state.copyWith(
            messages: updatedMessages,
            isSending: false,
          );
        }
      } catch (e) {
        print('Error processing WebSocket message: $e');
      }
    }
  }

  void _onWebSocketStatusChanged(WebSocketConnectionStatus status) {
    WebSocketStatus newStatus;
    switch (status) {
      case WebSocketConnectionStatus.disconnected:
        newStatus = WebSocketStatus.disconnected;
        break;
      case WebSocketConnectionStatus.connecting:
        newStatus = WebSocketStatus.connecting;
        break;
      case WebSocketConnectionStatus.connected:
        newStatus = WebSocketStatus.connected;
        break;
      case WebSocketConnectionStatus.error:
        newStatus = WebSocketStatus.error;
        break;
    }

    state = state.copyWith(webSocketStatus: newStatus);
  }

  Future<void> initializeChatRoom(ChatRoomEntity chatRoom, int userId) async {
    state = state.copyWith(
      status: ChatRoomStatus.loading,
      chatRoom: chatRoom,
    );

    try {
      // Connect to WebSocket
      await webSocketService.connect(
        userId: userId,
        roomId: chatRoom.id,
      );

      // Load initial messages
      await loadMessages();
    } catch (error) {
      state = state.copyWith(
        status: ChatRoomStatus.error,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> loadMessages({bool refresh = false}) async {
    if (state.chatRoom == null) return;

    if (refresh) {
      // Refresh: Reset to first page
      state = state.copyWith(
        status: ChatRoomStatus.refreshing,
        currentPage: 1,
        hasMoreMessages: true,
      );
    } else if (state.status == ChatRoomStatus.initial ||
        state.status == ChatRoomStatus.loading) {
      // Initial load: Start from first page
      state = state.copyWith(
        status: ChatRoomStatus.loadingMessages,
        currentPage: 1,
        hasMoreMessages: true,
      );
    } else {
      // Pagination: Check if we can load more
      if (state.status == ChatRoomStatus.loadingMessages || !state.hasMoreMessages) {
        return;
      }
      // Increment page and set loading status
      state = state.copyWith(
        status: ChatRoomStatus.loadingMessages,
        currentPage: state.currentPage + 1,
      );
    }

    try {
      final response = await getChatMessagesUseCase.execute(
        state.chatRoom!.id,
        page: refresh ? 1 : state.currentPage,
        limit: 50,
      );

      final newMessages =
          response.messages.reversed.toList(); // Reverse to show newest first
      final pagination = response.pagination;

      List<ChatMessageEntity> allMessages;
      if (refresh || pagination.page == 1) {
        allMessages = newMessages;
      } else {
        // For pagination, add older messages to the end
        allMessages = [...state.messages, ...newMessages];
      }

      state = state.copyWith(
        status: ChatRoomStatus.loaded,
        messages: allMessages,
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        hasMoreMessages: pagination.page < pagination.totalPages,
        errorMessage: null,
      );
    } catch (error) {
      state = state.copyWith(
        status: ChatRoomStatus.error,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> sendMessage(String messageText) async {
    if (state.chatRoom == null || messageText.trim().isEmpty) return;

    state = state.copyWith(
      isSending: true,
      messageInput: '',
    );

    try {
      await sendMessageUseCase.execute(
        state.chatRoom!.id,
        message: messageText.trim(),
        messageType: 'text',
      );

      // Don't add optimistically - let WebSocket handle adding the message
      state = state.copyWith(
        isSending: false,
      );
    } catch (error) {
      state = state.copyWith(
        isSending: false,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> markMessageAsRead(int messageId) async {
    try {
      await markMessageReadUseCase.execute(messageId);
    } catch (error) {
      // Silently fail for read receipts
      print('Failed to mark message as read: $error');
    }
  }

  void updateMessageInput(String text) {
    state = state.copyWith(messageInput: text);
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }

  @override
  void dispose() {
    webSocketService.disconnect();
    _messageSubscription?.cancel();
    _statusSubscription?.cancel();
    super.dispose();
  }
}
