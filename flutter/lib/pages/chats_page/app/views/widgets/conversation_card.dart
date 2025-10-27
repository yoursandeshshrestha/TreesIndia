import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/app/user_profile_provider.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';

import '../../../domain/entities/conversation_entity.dart';

class ConversationCard extends ConsumerWidget {
  final ConversationEntity conversation;

  const ConversationCard({
    super.key,
    required this.conversation,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userProfileState = ref.watch(userProfileProvider);
    final currentUserId = userProfileState.user?.userId;

    // Determine the other user in the conversation
    final otherUser = currentUserId == conversation.user1
        ? conversation.user2Data
        : conversation.user1Data;

    return GestureDetector(
      onTap: () {
        context.push('/conversations/${conversation.id}');
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        color: Colors.transparent,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar
            CircleAvatar(
              radius: 24,
              backgroundColor:
                  Theme.of(context).primaryColor.withValues(alpha: 0.1),
              backgroundImage: _isValidImageUrl(otherUser.avatar)
                  ? NetworkImage(otherUser.avatar!)
                  : null,
              child: !_isValidImageUrl(otherUser.avatar)
                  ? Icon(
                      Icons.person,
                      color: Theme.of(context).primaryColor,
                      size: 20,
                    )
                  : null,
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
                      // Other user name
                      Expanded(
                        child: B3Bold(text: otherUser.name),
                      ),
                      // Time
                      if (conversation.lastMessageCreatedAt != null)
                        B4Bold(
                          text: _formatDateTime(
                              conversation.lastMessageCreatedAt!),
                          color: AppColors.brandNeutral900,
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  // User type badge
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: _getUserTypeColor(otherUser.userType)
                          .withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: B5Regular(
                      text: _getUserTypeLabel(otherUser.userType),
                      color: _getUserTypeColor(otherUser.userType),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Last message
                  if (conversation.lastMessageText != null)
                    _buildLastMessage(currentUserId)
                  else
                    B3Regular(text: "No messages yet"),
                ],
              ),
            ),
            // Unread count badge
            if (conversation.unreadCount > 0)
              Container(
                margin: const EdgeInsets.only(left: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.brandPrimary500,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: B4Bold(
                  text: conversation.unreadCount > 99
                      ? '99+'
                      : '${conversation.unreadCount}',
                  color: Colors.white,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLastMessage(int? currentUserId) {
    final isCurrentUser = currentUserId != null &&
        conversation.lastMessageSenderId == currentUserId;
    final messageText = conversation.lastMessageText!;

    if (isCurrentUser) {
      // Current user sent the message - show with "You: " prefix
      return Row(
        children: [
          Expanded(
            child: B3Regular(
              text: "You: $messageText",
              color: AppColors.brandNeutral600,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      );
    } else {
      // Other user sent the message - show message directly
      return Row(
        children: [
          Expanded(
            child: B3Regular(
              text: messageText,
              color: conversation.unreadCount > 0
                  ? AppColors.brandNeutral900
                  : AppColors.brandNeutral600,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      );
    }
  }

  Color _getUserTypeColor(String userType) {
    switch (userType.toLowerCase()) {
      case 'worker':
        return AppColors.brandPrimary500;
      case 'customer':
        return AppColors.brandSecondary500;
      case 'vendor':
        return Colors.purple;
      default:
        return AppColors.brandNeutral500;
    }
  }

  String _getUserTypeLabel(String userType) {
    switch (userType.toLowerCase()) {
      case 'worker':
        return 'Worker';
      case 'customer':
        return 'Customer';
      case 'vendor':
        return 'Vendor';
      default:
        return userType;
    }
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
