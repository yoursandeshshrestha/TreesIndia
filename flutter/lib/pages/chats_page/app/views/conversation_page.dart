import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/app/user_profile_provider.dart';
import 'package:trees_india/commons/services/conversation_websocket_service.dart';
import 'package:trees_india/pages/chats_page/app/viewmodels/conversation_notifier.dart';
import '../viewmodels/conversation_state.dart';
import '../providers/conversation_provider.dart';
import 'widgets/message_bubble.dart';
import 'widgets/message_input.dart';

class ConversationPage extends ConsumerStatefulWidget {
  final int conversationId;

  const ConversationPage({
    super.key,
    required this.conversationId,
  });

  @override
  ConsumerState<ConversationPage> createState() => _ConversationPageState();
}

class _ConversationPageState extends ConsumerState<ConversationPage> {
  final ScrollController _scrollController = ScrollController();
  late ConversationNotifier _notifier;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _notifier =
        ref.read(conversationNotifierProvider(widget.conversationId).notifier);

    // Initialize the conversation when page loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final userProfile = ref.read(userProfileProvider);
      final currentUserId = userProfile.user?.userId;

      if (currentUserId != null) {
        ref
            .read(conversationNotifierProvider(widget.conversationId).notifier)
            .loadMessages();
      }
    });
  }

  @override
  void dispose() {
    // Mark conversation as read when user leaves the page
    // This ensures all messages that were visible to the user are marked as read
    _notifier
        .markAsRead();

    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      final conversationState =
          ref.read(conversationNotifierProvider(widget.conversationId));
      if (conversationState.hasMoreMessages &&
          conversationState.status != ConversationStatus.loadingMessages) {
        ref
            .read(conversationNotifierProvider(widget.conversationId).notifier)
            .loadMoreMessages();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final conversationState =
        ref.watch(conversationNotifierProvider(widget.conversationId));

    return Scaffold(
      appBar: _buildAppBar(conversationState),
      body: _buildBody(conversationState),
    );
  }

  PreferredSizeWidget _buildAppBar(ConversationState state) {
    // We'll get conversation details from the conversations list if available
    // For now, show a simple app bar
    return AppBar(
      title: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Conversation',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
        ],
      ),
      actions: [
        _buildConnectionStatus(state.webSocketStatus),
      ],
    );
  }

  Widget _buildConnectionStatus(ConversationWebSocketConnectionStatus status) {
    Color color;
    IconData icon;
    String text;

    switch (status) {
      case ConversationWebSocketConnectionStatus.connected:
        color = Colors.green;
        icon = Icons.circle;
        text = 'Connected';
        break;
      case ConversationWebSocketConnectionStatus.connecting:
        color = Colors.orange;
        icon = Icons.circle;
        text = 'Connecting';
        break;
      case ConversationWebSocketConnectionStatus.error:
        color = Colors.red;
        icon = Icons.error;
        text = 'Error';
        break;
      case ConversationWebSocketConnectionStatus.disconnected:
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

  Widget _buildBody(ConversationState state) {
    switch (state.status) {
      case ConversationStatus.initial:
      case ConversationStatus.loading:
        return const Center(
          child: CircularProgressIndicator(),
        );

      case ConversationStatus.error:
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
                'Failed to load conversation',
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
                      .read(conversationNotifierProvider(widget.conversationId)
                          .notifier)
                      .loadMessages();
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        );

      case ConversationStatus.loaded:
      case ConversationStatus.loadingMessages:
      case ConversationStatus.sendingMessage:
      case ConversationStatus.refreshing:
        return Column(
          children: [
            Expanded(
              child: _buildMessagesList(state),
            ),
            MessageInput(
              onSendMessage: (message) {
                ref
                    .read(conversationNotifierProvider(widget.conversationId)
                        .notifier)
                    .sendMessage(message);
              },
              isEnabled: !state.isSending &&
                  state.webSocketStatus ==
                      ConversationWebSocketConnectionStatus.connected,
            ),
          ],
        );
    }
  }

  Widget _buildMessagesList(ConversationState state) {
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
            .read(conversationNotifierProvider(widget.conversationId).notifier)
            .refreshMessages();
      },
      child: ListView.builder(
        controller: _scrollController,
        reverse: true, // Show newest messages at bottom
        physics: const AlwaysScrollableScrollPhysics(),
        itemCount: state.messages.length +
            (state.status == ConversationStatus.loadingMessages ? 1 : 0),
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
