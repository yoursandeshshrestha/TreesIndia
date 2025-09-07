import 'package:equatable/equatable.dart';
import '../../domain/entities/chat_message_entity.dart';
import '../../domain/entities/chat_room_entity.dart';

enum ChatRoomStatus {
  initial,
  loading,
  loaded,
  loadingMessages,
  sendingMessage,
  error,
  refreshing,
}

enum WebSocketStatus {
  disconnected,
  connecting,
  connected,
  error,
}

class ChatRoomState extends Equatable {
  final ChatRoomStatus status;
  final WebSocketStatus webSocketStatus;
  final ChatRoomEntity? chatRoom;
  final List<ChatMessageEntity> messages;
  final String? errorMessage;
  final int currentPage;
  final int totalPages;
  final bool hasMoreMessages;
  final String messageInput;
  final bool isSending;

  const ChatRoomState({
    this.status = ChatRoomStatus.initial,
    this.webSocketStatus = WebSocketStatus.disconnected,
    this.chatRoom,
    this.messages = const [],
    this.errorMessage,
    this.currentPage = 1,
    this.totalPages = 1,
    this.hasMoreMessages = true,
    this.messageInput = '',
    this.isSending = false,
  });

  ChatRoomState copyWith({
    ChatRoomStatus? status,
    WebSocketStatus? webSocketStatus,
    ChatRoomEntity? chatRoom,
    List<ChatMessageEntity>? messages,
    String? errorMessage,
    int? currentPage,
    int? totalPages,
    bool? hasMoreMessages,
    String? messageInput,
    bool? isSending,
  }) {
    return ChatRoomState(
      status: status ?? this.status,
      webSocketStatus: webSocketStatus ?? this.webSocketStatus,
      chatRoom: chatRoom ?? this.chatRoom,
      messages: messages ?? this.messages,
      errorMessage: errorMessage ?? this.errorMessage,
      currentPage: currentPage ?? this.currentPage,
      totalPages: totalPages ?? this.totalPages,
      hasMoreMessages: hasMoreMessages ?? this.hasMoreMessages,
      messageInput: messageInput ?? this.messageInput,
      isSending: isSending ?? this.isSending,
    );
  }

  @override
  List<Object?> get props => [
        status,
        webSocketStatus,
        chatRoom,
        messages,
        errorMessage,
        currentPage,
        totalPages,
        hasMoreMessages,
        messageInput,
        isSending,
      ];
}