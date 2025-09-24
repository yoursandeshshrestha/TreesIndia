import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import '../../../domain/entities/conversation_message_entity.dart';

class MessageBubble extends StatelessWidget {
  final ConversationMessageEntity message;
  final bool isMe;

  const MessageBubble({
    super.key,
    required this.message,
    required this.isMe,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(
        top: 4,
        bottom: 4,
        left: isMe ? 64 : 16,
        right: isMe ? 16 : 64,
      ),
      child: Row(
        mainAxisAlignment:
            isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          Flexible(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment:
                  isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                if (!isMe && message.sender.name.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: B4Regular(
                      text: message.sender.name,
                      color: AppColors.brandNeutral700,
                    ),
                  ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: isMe ? const Color(0xFF00a871) : Colors.grey[200],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Wrap(
                    alignment: WrapAlignment.end,
                    crossAxisAlignment: WrapCrossAlignment.end,
                    children: [
                      B3Regular(
                        text: message.message,
                        color: isMe ? Colors.white : Colors.black87,
                      ),
                      const SizedBox(width: 8),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          B5Regular(
                            text: _formatTime(message.createdAt),
                            color: isMe
                                ? AppColors.brandNeutral300
                                : AppColors.brandNeutral500,
                          ),
                          if (isMe) ...[
                            const SizedBox(width: 4),
                            Icon(
                              _getStatusIcon(),
                              size: 16,
                              color: _getStatusColor(),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getStatusIcon() {
    if (message.isRead) {
      return Icons.done_all;
    } else {
      return Icons.check;
    }
  }

  Color _getStatusColor() {
    if (message.isRead) {
      return AppColors.brandPrimary500;
    } else {
      return AppColors.accentIndigo50;
    }
  }

  String _formatTime(String dateTimeString) {
    try {
      // Parse the datetime and convert to GMT+5:30 (India Standard Time)
      final utcDateTime = DateTime.parse(dateTimeString).toUtc();
      final istDateTime =
          utcDateTime.add(const Duration(hours: 5, minutes: 30));

      // Get current time in IST
      final nowUtc = DateTime.now().toUtc();
      final nowIst = nowUtc.add(const Duration(hours: 5, minutes: 30));

      final today = DateTime(nowIst.year, nowIst.month, nowIst.day);
      final yesterday = today.subtract(const Duration(days: 1));
      final messageDate =
          DateTime(istDateTime.year, istDateTime.month, istDateTime.day);

      final hour = istDateTime.hour;
      final minute = istDateTime.minute.toString().padLeft(2, '0');

      // Convert to 12-hour format with AM/PM
      final hour12 = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);
      final amPm = hour < 12 ? 'AM' : 'PM';
      final timeString = '$hour12:$minute $amPm';

      if (messageDate == today) {
        // Today - show time only
        return timeString;
      } else if (messageDate == yesterday) {
        // Yesterday - show "Yesterday"
        return '$timeString - Yesterday';
      } else {
        // Other days - show month and day (e.g., "Aug 20", "Jan 28")
        final monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
        ];
        final monthName = monthNames[istDateTime.month - 1];
        return '$timeString - $monthName ${istDateTime.day}';
      }
    } catch (e) {
      return '';
    }
  }
}
