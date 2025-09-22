import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../../../domain/entities/notification_entity.dart';

class NotificationItemWidget extends StatelessWidget {
  final NotificationEntity notification;
  final VoidCallback? onTap;

  const NotificationItemWidget({
    super.key,
    required this.notification,
    this.onTap,
  });

  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 30) {
      return '${difference.inDays}d ago';
    } else {
      return DateFormat('MMM dd, yyyy').format(dateTime);
    }
  }

  String _formatCurrency(dynamic amount) {
    if (amount == null) return '';
    return '₹${NumberFormat('#,##,###').format(amount)}';
  }

  String _formatDate(String? dateString) {
    if (dateString == null) return '';
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('MMM dd, yyyy').format(date);
    } catch (e) {
      return '';
    }
  }

  String _getBookingRef(Map<String, dynamic>? data) {
    return data?['booking_ref'] as String? ?? '';
  }

  String _getServiceName(Map<String, dynamic>? data) {
    return data?['service_name'] as String? ?? '';
  }

  String _getWorkerName(Map<String, dynamic>? data) {
    return data?['worker_name'] as String? ?? '';
  }

  String _getCancellationReason(String? reason) {
    switch (reason) {
      case 'price_concern':
        return 'Price concern';
      case 'service_not_available':
        return 'Service not available';
      case 'customer_request':
        return 'Customer request';
      case 'technical_issue':
        return 'Technical issue';
      default:
        return reason ?? 'Unknown reason';
    }
  }

  IconData _getNotificationIcon(String type) {
    switch (type.toLowerCase()) {
      case 'booking_created':
      case 'booking_confirmed':
        return Icons.event_available;
      case 'worker_assigned':
      case 'worker_started':
        return Icons.person_pin_circle;
      case 'worker_completed':
        return Icons.check_circle;
      case 'payment_received':
      case 'payment_confirmation':
        return Icons.payment;
      case 'subscription_purchase':
        return Icons.card_membership;
      case 'property_created':
        return Icons.home;
      case 'project_created':
        return Icons.construction;
      case 'conversation_started':
        return Icons.chat;
      case 'login_success':
        return Icons.login;
      case 'quote_provided':
        return Icons.request_quote;
      case 'booking_cancelled':
        return Icons.cancel;
      default:
        return Icons.notifications;
    }
  }

  Color _getNotificationIconColor(String type) {
    switch (type.toLowerCase()) {
      case 'booking_created':
      case 'booking_confirmed':
        return AppColors.brandPrimary600;
      case 'worker_assigned':
      case 'worker_started':
        return AppColors.accentTeal600;
      case 'worker_completed':
        return AppColors.stateGreen600;
      case 'payment_received':
      case 'payment_confirmation':
        return AppColors.stateGreen600;
      case 'subscription_purchase':
        return AppColors.accentPurple600;
      case 'property_created':
        return AppColors.brandSecondary600;
      case 'project_created':
        return AppColors.accentIndigo600;
      case 'conversation_started':
        return AppColors.brandPrimary600;
      case 'login_success':
        return AppColors.stateGreen600;
      case 'quote_provided':
        return AppColors.stateYellow600;
      case 'booking_cancelled':
        return AppColors.stateRed600;
      default:
        return AppColors.brandNeutral600;
    }
  }

  Widget _buildNotificationContent() {
    switch (notification.type.toLowerCase()) {
      case 'quote_provided':
        return _buildQuoteContent();
      case 'worker_assigned':
      case 'worker_started':
        return _buildWorkerContent();
      case 'booking_cancelled':
        return _buildCancellationContent();
      case 'subscription_purchase':
        return _buildSubscriptionContent();
      case 'property_created':
        return _buildPropertyContent();
      default:
        return _buildDefaultContent();
    }
  }

  Widget _buildQuoteContent() {
    final data = notification.data;
    final amount = data?['amount'];
    final bookingRef = _getBookingRef(data);
    final serviceName = _getServiceName(data);
    final validUntil = data?['valid_until'] as String?;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        B3Regular(
          text: notification.message,
          color: AppColors.brandNeutral600,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        if (amount != null) ...[
          const SizedBox(height: AppSpacing.xs),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: AppSpacing.xs,
            ),
            decoration: BoxDecoration(
              color: AppColors.stateYellow50,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: AppColors.stateYellow200),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.currency_rupee,
                  size: 14,
                  color: AppColors.stateYellow700,
                ),
                const SizedBox(width: 2),
                B3Bold(
                  text: _formatCurrency(amount),
                  color: AppColors.stateYellow700,
                ),
              ],
            ),
          ),
        ],
        if (bookingRef.isNotEmpty || serviceName.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.xs),
          if (serviceName.isNotEmpty)
            B4Regular(
              text: serviceName,
              color: AppColors.brandNeutral500,
            ),
          if (bookingRef.isNotEmpty)
            B4Regular(
              text: 'Ref: $bookingRef',
              color: AppColors.brandNeutral400,
            ),
        ],
        if (validUntil != null) ...[
          const SizedBox(height: AppSpacing.xs),
          B4Regular(
            text: 'Valid until: ${_formatDate(validUntil)}',
            color: AppColors.stateRed600,
          ),
        ],
      ],
    );
  }

  Widget _buildWorkerContent() {
    final data = notification.data;
    final workerName = _getWorkerName(data);
    final bookingRef = _getBookingRef(data);
    final serviceName = _getServiceName(data);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        B3Regular(
          text: notification.message,
          color: AppColors.brandNeutral600,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: AppSpacing.xs),
        if (workerName.isNotEmpty)
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: AppSpacing.xs,
            ),
            decoration: BoxDecoration(
              color: AppColors.accentTeal50,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: AppColors.accentTeal200),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.person,
                  size: 14,
                  color: AppColors.accentTeal700,
                ),
                const SizedBox(width: 4),
                B4Bold(
                  text: workerName,
                  color: AppColors.accentTeal700,
                ),
              ],
            ),
          ),
        if (serviceName.isNotEmpty || bookingRef.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.xs),
          if (serviceName.isNotEmpty)
            B4Regular(
              text: serviceName,
              color: AppColors.brandNeutral500,
            ),
          if (bookingRef.isNotEmpty)
            B4Regular(
              text: 'Ref: $bookingRef',
              color: AppColors.brandNeutral400,
            ),
        ],
      ],
    );
  }

  Widget _buildCancellationContent() {
    final data = notification.data;
    final reason = data?['reason'] as String?;
    final bookingRef = _getBookingRef(data);
    final serviceName = _getServiceName(data);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        B3Regular(
          text: notification.message,
          color: AppColors.brandNeutral600,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        if (reason != null) ...[
          const SizedBox(height: AppSpacing.xs),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: AppSpacing.xs,
            ),
            decoration: BoxDecoration(
              color: AppColors.stateRed50,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: AppColors.stateRed200),
            ),
            child: B4Regular(
              text: 'Reason: ${_getCancellationReason(reason)}',
              color: AppColors.stateRed700,
            ),
          ),
        ],
        if (serviceName.isNotEmpty || bookingRef.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.xs),
          if (serviceName.isNotEmpty)
            B4Regular(
              text: serviceName,
              color: AppColors.brandNeutral500,
            ),
          if (bookingRef.isNotEmpty)
            B4Regular(
              text: 'Ref: $bookingRef',
              color: AppColors.brandNeutral400,
            ),
        ],
      ],
    );
  }

  Widget _buildSubscriptionContent() {
    final data = notification.data;
    final amount = data?['amount'];
    final endDate = data?['end_date'] as String?;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        B3Regular(
          text: notification.message,
          color: AppColors.brandNeutral600,
          maxLines: 3,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: AppSpacing.xs),
        Container(
          padding: const EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            color: AppColors.accentPurple50,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.accentPurple200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (amount != null)
                Row(
                  children: [
                    const Icon(
                      Icons.currency_rupee,
                      size: 14,
                      color: AppColors.accentPurple700,
                    ),
                    B4Bold(
                      text: _formatCurrency(amount),
                      color: AppColors.accentPurple700,
                    ),
                  ],
                ),
              if (endDate != null) ...[
                const SizedBox(height: 2),
                B4Regular(
                  text: 'Valid until: ${_formatDate(endDate)}',
                  color: AppColors.accentPurple600,
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPropertyContent() {
    final data = notification.data;
    final address = data?['address'] as String?;
    final status = data?['status'] as String?;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        B3Regular(
          text: notification.message,
          color: AppColors.brandNeutral600,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        if (address != null) ...[
          const SizedBox(height: AppSpacing.xs),
          Row(
            children: [
              const Icon(
                Icons.location_on,
                size: 14,
                color: AppColors.brandNeutral500,
              ),
              const SizedBox(width: 4),
              Expanded(
                child: B4Regular(
                  text: address,
                  color: AppColors.brandNeutral600,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
        if (status != null) ...[
          const SizedBox(height: AppSpacing.xs),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: AppSpacing.xs,
            ),
            decoration: BoxDecoration(
              color: AppColors.stateGreen50,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: AppColors.stateGreen200),
            ),
            child: B4Bold(
              text: status.toUpperCase(),
              color: AppColors.stateGreen700,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildDefaultContent() {
    return B3Regular(
      text: notification.message,
      color: AppColors.brandNeutral600,
      maxLines: 3,
      overflow: TextOverflow.ellipsis,
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    switch (notification.type.toLowerCase()) {
      case 'quote_provided':
        return _buildQuoteActionButtons(context);
      // case 'booking_cancelled':
      //   return _buildCancellationActionButtons(context);
      case 'property_created':
        return _buildPropertyActionButtons(context);
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildQuoteActionButtons(BuildContext context) {
    
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.sm),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () {
                // Navigate to quote details
                context.push('/bookings'); // Navigate to bookings to view quote
              },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.brandPrimary600),
                padding: const EdgeInsets.symmetric(vertical: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
              child: B4Bold(
                text: 'View Quote',
                color: AppColors.brandPrimary600,
              ),
            ),
          ),
          
        ],
      ),
    );
  }

  

  Widget _buildPropertyActionButtons(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.sm),
      child: SizedBox(
        width: double.infinity,
        child: OutlinedButton(
          onPressed: () {
            // Navigate to properties page
            context.push('/my-properties');
          },
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: AppColors.brandPrimary600),
            padding: const EdgeInsets.symmetric(vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(6),
            ),
          ),
          child: B4Bold(
            text: 'View Property',
            color: AppColors.brandPrimary600,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: notification.isRead ? Colors.white : AppColors.brandPrimary50,
          border: const Border(
            bottom: BorderSide(
              color: AppColors.brandNeutral100,
              width: 1,
            ),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Notification icon
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _getNotificationIconColor(notification.type).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                _getNotificationIcon(notification.type),
                size: 20,
                color: _getNotificationIconColor(notification.type),
              ),
            ),

            const SizedBox(width: AppSpacing.md),

            // Notification content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and time
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: B2Bold(
                          text: notification.title,
                          color: notification.isRead
                              ? AppColors.brandNeutral700
                              : AppColors.brandNeutral900,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      B4Regular(
                        text: _formatTimeAgo(notification.createdAt),
                        color: AppColors.brandNeutral500,
                      ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.xs),

                  // Enhanced content based on notification type
                  _buildNotificationContent(),

                  // Action buttons for actionable notifications
                  _buildActionButtons(context),

                  // Unread indicator
                  if (!notification.isRead) ...[
                    const SizedBox(height: AppSpacing.sm),
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppColors.brandPrimary600,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}