import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/pages/chats_page/app/providers/chat_room_provider.dart';
import 'package:trees_india/commons/app/user_profile_provider.dart';
import '../../domain/entities/chat_room_entity.dart';
import '../viewmodels/chat_room_state.dart';
import 'widgets/message_bubble.dart';
import 'widgets/message_input.dart';
import 'widgets/booking_details_bottom_sheet.dart';

class ChatRoomPage extends ConsumerStatefulWidget {
  final int roomId;
  final ChatRoomEntity? chatRoom; // Can be passed from previous screen

  const ChatRoomPage({
    super.key,
    required this.roomId,
    this.chatRoom,
  });

  @override
  ConsumerState<ChatRoomPage> createState() => _ChatRoomPageState();
}

class _ChatRoomPageState extends ConsumerState<ChatRoomPage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);

    // Initialize the chat room when page loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final userProfile = ref.read(userProfileProvider);
      final currentUserId = userProfile.user?.userId;

      if (currentUserId != null) {
        if (widget.chatRoom != null) {
          ref
              .read(chatRoomNotifierProvider(widget.roomId).notifier)
              .initializeChatRoom(widget.chatRoom!, currentUserId);
        } else {
          // Load messages if we don't have the chat room data
          ref
              .read(chatRoomNotifierProvider(widget.roomId).notifier)
              .loadMessages();
        }
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      final chatRoomState = ref.read(chatRoomNotifierProvider(widget.roomId));
      if (chatRoomState.hasMoreMessages &&
          chatRoomState.status != ChatRoomStatus.loadingMessages) {
        ref
            .read(chatRoomNotifierProvider(widget.roomId).notifier)
            .loadMessages();
      }
    }
  }

  void _showBookingDetailsBottomSheet(BuildContext context, ChatRoomEntity chatRoom) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
        ),
        child: BookingDetailsBottomSheet(chatRoom: chatRoom),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final chatRoomState = ref.watch(chatRoomNotifierProvider(widget.roomId));

    return Scaffold(
      appBar: _buildAppBar(chatRoomState),
      body: _buildBody(chatRoomState),
    );
  }

  PreferredSizeWidget _buildAppBar(ChatRoomState state) {
    final chatRoom = state.chatRoom ?? widget.chatRoom;
    final authState = ref.watch(authProvider);
    final userType = authState.userType;
    final chatUserName = userType == 'worker'
        ? chatRoom?.booking?.contactPerson
        : chatRoom?.booking?.workerAssignment?.worker?.name;

    return AppBar(
      title: GestureDetector(
        onTap: () {
          if (chatRoom?.booking != null) {
            _showBookingDetailsBottomSheet(context, chatRoom!);
          }
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              chatUserName ?? chatRoom?.roomName ?? 'Chat',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            if (chatRoom?.booking != null)
              Text(
                'Booking: ${chatRoom!.booking!.bookingReference}',
                style:
                    const TextStyle(fontSize: 12, fontWeight: FontWeight.normal),
              ),
          ],
        ),
      ),
      actions: [
        _buildConnectionStatus(state.webSocketStatus),
        // IconButton(
        //   onPressed: () {
        //     ref
        //         .read(chatRoomNotifierProvider(widget.roomId).notifier)
        //         .loadMessages(refresh: true);
        //   },
        //   icon: const Icon(Icons.refresh),
        // ),
      ],
    );
  }

  Widget _buildConnectionStatus(WebSocketStatus status) {
    Color color;
    IconData icon;
    String text;

    switch (status) {
      case WebSocketStatus.connected:
        color = Colors.green;
        icon = Icons.circle;
        text = 'Connected';
        break;
      case WebSocketStatus.connecting:
        color = Colors.orange;
        icon = Icons.circle;
        text = 'Connecting';
        break;
      case WebSocketStatus.error:
        color = Colors.red;
        icon = Icons.error;
        text = 'Error';
        break;
      case WebSocketStatus.disconnected:
        color = Colors.grey;
        icon = Icons.circle;
        text = 'Disconnected';
        break;
    }

    return Row(
      children: [
        Container(
          margin: const EdgeInsets.only(right: 16),
          child: Row(
            children: [
              Icon(
                icon,
                size: 12,
                color: color,
              ),
              const SizedBox(width: 2),
              B4Medium(
                text: text,
                color: color,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBody(ChatRoomState state) {
    switch (state.status) {
      case ChatRoomStatus.initial:
      case ChatRoomStatus.loading:
        return const Center(
          child: CircularProgressIndicator(),
        );

      case ChatRoomStatus.error:
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: Colors.grey[400],
              ),
              const SizedBox(height: 16),
              Text(
                'Failed to load chat',
                style: TextStyle(
                  fontSize: 18,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                state.errorMessage ?? 'Unknown error occurred',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[500],
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  ref
                      .read(chatRoomNotifierProvider(widget.roomId).notifier)
                      .loadMessages();
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        );

      case ChatRoomStatus.loaded:
      case ChatRoomStatus.loadingMessages:
      case ChatRoomStatus.sendingMessage:
      case ChatRoomStatus.refreshing:
        return Column(
          children: [
            Expanded(
              child: _buildMessagesList(state),
            ),
            MessageInput(
              onSendMessage: (message) {
                ref
                    .read(chatRoomNotifierProvider(widget.roomId).notifier)
                    .sendMessage(message);
              },
              isEnabled: !state.isSending &&
                  state.webSocketStatus == WebSocketStatus.connected,
            ),
          ],
        );
    }
  }

  Widget _buildMessagesList(ChatRoomState state) {
    if (state.messages.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.chat_bubble_outline,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No messages yet',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Start the conversation!',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref
            .read(chatRoomNotifierProvider(widget.roomId).notifier)
            .loadMessages(refresh: true);
      },
      child: ListView.builder(
        controller: _scrollController,
        reverse: true, // Show newest messages at bottom
        physics: const AlwaysScrollableScrollPhysics(),
        itemCount: state.messages.length +
            (state.status == ChatRoomStatus.loadingMessages ? 1 : 0),
        itemBuilder: (context, index) {
          if (index >= state.messages.length) {
            return const Padding(
              padding: EdgeInsets.all(16),
              child: Center(
                child: CircularProgressIndicator(),
              ),
            );
          }

          final message = state.messages[index];
          final userProfile = ref.read(userProfileProvider);
          final currentUserId = userProfile.user?.userId;
          final isMe =
              currentUserId != null && message.senderId == currentUserId;

          return MessageBubble(
            message: message,
            isMe: isMe,
          );
        },
      ),
    );
  }
}
