import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/app/user_profile_provider.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/services/conversation_websocket_service.dart';
import 'package:trees_india/pages/chats_page/app/providers/conversations_provider.dart';
import 'package:trees_india/pages/chats_page/app/viewmodels/conversations_notifier.dart';

import '../providers/conversation_provider.dart';
import '../viewmodels/conversation_state.dart';
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
  late ConversationsNotifier _conversationsNotifier;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);

    // Initialize the conversation when page loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final userProfile = ref.read(userProfileProvider);
      final currentUserId = userProfile.user?.userId;
      _conversationsNotifier = ref.read(conversationsNotifierProvider.notifier);

      if (currentUserId != null) {
        // Load conversations list to get participant names
        _conversationsNotifier.loadConversations(refresh: true);

        // Load messages for this specific conversation
        ref
            .read(conversationNotifierProvider(widget.conversationId).notifier)
            .loadMessages();
      }
    });
  }

  @override
  void dispose() {
    _conversationsNotifier.markConversationAsRead(widget.conversationId);
    // Mark conversation as read when user leaves the page
    // This ensures all messages that were visible to the user are marked as read
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
    // Get conversation details from the conversations list
    final conversationsState = ref.watch(conversationsNotifierProvider);
    final userProfile = ref.read(userProfileProvider);
    final currentUserId = userProfile.user?.userId;

    // Find the conversation by ID
    final conversation = conversationsState.conversations
        .where((conv) => conv.id == widget.conversationId)
        .firstOrNull;

    String title = 'Conversation';
    Widget? avatar;

    if (conversation != null && currentUserId != null) {
      // Determine which user is the other person
      final otherUser = conversation.user1 == currentUserId
          ? conversation.user2Data
          : conversation.user1Data;
      title = otherUser.name;

      // Build avatar
      avatar = CircleAvatar(
        radius: 18,
        backgroundColor: Theme.of(context).primaryColor.withValues(alpha: 0.1),
        backgroundImage: _isValidImageUrl(otherUser.avatar)
            ? NetworkImage(otherUser.avatar!)
            : null,
        child: !_isValidImageUrl(otherUser.avatar)
            ? Icon(
                Icons.person,
                color: Theme.of(context).primaryColor,
                size: 18,
              )
            : null,
      );
    }

    return AppBar(
      title: Row(
        children: [
          if (avatar != null) ...[
            avatar,
            const SizedBox(width: 12),
          ],
          Text(
            title,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
        ],
      ),
      // actions: [
      // _buildConnectionStatus(state.webSocketStatus),
      // ],
    );
  }

  // Widget _buildConnectionStatus(ConversationWebSocketConnectionStatus status) {
  //   Color color;
  //   IconData icon;
  //   String text;

  //   switch (status) {
  //     case ConversationWebSocketConnectionStatus.connected:
  //       color = Colors.green;
  //       icon = Icons.circle;
  //       text = 'Connected';
  //       break;
  //     case ConversationWebSocketConnectionStatus.connecting:
  //       color = Colors.orange;
  //       icon = Icons.circle;
  //       text = 'Connecting';
  //       break;
  //     case ConversationWebSocketConnectionStatus.error:
  //       color = Colors.red;
  //       icon = Icons.error;
  //       text = 'Error';
  //       break;
  //     case ConversationWebSocketConnectionStatus.disconnected:
  //       color = Colors.grey;
  //       icon = Icons.circle;
  //       text = 'Disconnected';
  //       break;
  //   }

  //   return Row(
  //     children: [
  //       Container(
  //         margin: const EdgeInsets.only(right: 16),
  //         child: Row(
  //           children: [
  //             Icon(
  //               icon,
  //               size: 12,
  //               color: color,
  //             ),
  //             const SizedBox(width: 2),
  //             B4Medium(
  //               text: text,
  //               color: color,
  //             ),
  //           ],
  //         ),
  //       ),
  //     ],
  //   );
  // }

  Widget _buildBody(ConversationState state) {
    switch (state.status) {
      case ConversationStatus.initial:
      case ConversationStatus.loading:
        // Initial load - show full screen centered loading indicator

        return Column(
          children: [
            const Expanded(
              child: Center(
                child: CircularProgressIndicator(
                  color: Color(0xFF055c3a),
                ),
              ),
            ),
            MessageInput(
              onSendMessage: (message) {},
              isEnabled: false,
            ),
          ],
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
        // Show messages with appropriate loading indicators based on state
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
      // Show empty state when no messages
      // Note: During refreshing with empty messages, RefreshIndicator will show its own loading
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

    // RefreshIndicator handles the pull-to-refresh loading state
    // It shows its native loading indicator when refreshing
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
        // Add extra item for loading more indicator when fetching older messages
        itemCount: state.messages.length +
            (state.status == ConversationStatus.loadingMessages ? 1 : 0),
        itemBuilder: (context, index) {
          // Show loading indicator at the top (in reverse list, this is the last item)
          // when loading more older messages
          if (index >= state.messages.length) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Theme.of(context).primaryColor.withOpacity(0.7),
                    ),
                  ),
                ),
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

  bool _isValidImageUrl(String? url) {
    if (url == null || url.isEmpty) return false;

    try {
      final uri = Uri.parse(url);
      return uri.hasScheme &&
          (uri.scheme == 'http' || uri.scheme == 'https') &&
          uri.hasAuthority &&
          uri.host.isNotEmpty;
    } catch (e) {
      return false;
    }
  }
}
