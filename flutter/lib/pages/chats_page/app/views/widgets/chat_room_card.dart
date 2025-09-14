import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/app/user_profile_provider.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/pages/chats_page/domain/entities/chat_message_entity.dart';

import '../../../domain/entities/chat_room_entity.dart';

class ChatRoomCard extends ConsumerWidget {
  final ChatRoomEntity chatRoom;

  const ChatRoomCard({
    super.key,
    required this.chatRoom,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userProfileState = ref.watch(userProfileProvider);
    final currentUserId = userProfileState.user?.userId;

    // Get chat user name based on user type
    // final userType = userProfileState.user?.userType;
    // final chatUserName = userType == 'worker'
    //     ? chatRoom.booking?.contactPerson
    //     : chatRoom.booking?.workerAssignment?.worker?.name;

    // Get the last message
    final lastMessage = chatRoom.chatMessages?.isNotEmpty == true
        ? chatRoom.chatMessages!.last
        : null;

    return GestureDetector(
      onTap: () {
        context.push('/chats/${chatRoom.id}', extra: chatRoom);
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.brandNeutral100,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.brandNeutral200),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar
            CircleAvatar(
              radius: 24,
              backgroundColor:
                  Theme.of(context).primaryColor.withValues(alpha: 0.1),
              child: Icon(
                _getIconForRoomType(chatRoom.roomType),
                color: Theme.of(context).primaryColor,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Room name
                      Expanded(
                        child: B3Medium(text: chatRoom.roomName),
                      ),
                      // Time
                      if (chatRoom.lastMessageAt != null)
                        B4Bold(
                          text: _formatDateTime(chatRoom.lastMessageAt!),
                          color: AppColors.brandNeutral900,
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  // // Chat user name
                  // if (chatUserName != null)
                  //   B4Bold(
                  //     text: chatUserName,
                  //     color: AppColors.brandNeutral600,
                  //   ),
                  // const SizedBox(height: 4),
                  // Last message
                  if (lastMessage != null)
                    _buildLastMessage(lastMessage, currentUserId)
                  else
                    B3Medium(text: "No messages yet"),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getIconForRoomType(String roomType) {
    switch (roomType) {
      case 'booking':
        return Icons.work;
      case 'property':
        return Icons.home;
      case 'worker_inquiry':
        return Icons.person_search;
      default:
        return Icons.chat;
    }
  }

  Widget _buildLastMessage(ChatMessageEntity lastMessage, int? currentUserId) {
    final isCurrentUser =
        currentUserId != null && lastMessage.senderId == currentUserId;
    final messageText = lastMessage.message;

    Color getMessageStatusColor() {
      if (lastMessage.isRead) {
        return AppColors.brandPrimary500;
      } else {
        return AppColors.brandNeutral500;
      }
    }

    IconData getMessageStatusIcon() {
      if (lastMessage.isRead) {
        return Icons.done_all;
      } else if (lastMessage.status == "delivered") {
        return Icons.done_all;
      } else {
        return Icons.check;
      }
    }

    if (isCurrentUser) {
      // Current user sent the message - show icon + text
      return Row(
        children: [
          Icon(
            getMessageStatusIcon(),
            size: 16,
            color: getMessageStatusColor(),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: B3Medium(
              text: messageText,
              color: AppColors.brandNeutral600,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      );
    } else {
      // Other user sent the message - show only text
      return Row(
        children: [
          Expanded(
            child: B3Medium(
              text: messageText,
              color: AppColors.brandNeutral600,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (!lastMessage.isRead) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6),
              decoration: BoxDecoration(
                color: Colors.green,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.green),
              ),
              child: B4Regular(text: "New messages", color: Colors.white),
            )
          ],
        ],
      );
    }
  }

  String _formatDateTime(String dateTimeString) {
    try {
      final dateTime = DateTime.parse(dateTimeString);
      final now = DateTime.now();
      final difference = now.difference(dateTime);

      if (difference.inDays > 7) {
        return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
      } else if (difference.inDays > 0) {
        return '${difference.inDays}d ago';
      } else if (difference.inHours > 0) {
        return '${difference.inHours}h ago';
      } else if (difference.inMinutes > 0) {
        return '${difference.inMinutes}m ago';
      } else {
        return 'Just now';
      }
    } catch (e) {
      return '';
    }
  }
}
