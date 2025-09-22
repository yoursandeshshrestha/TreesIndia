import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/app/auth_provider.dart';

import '../providers/notification_providers.dart';
import '../viewmodels/notification_state.dart';
import 'widgets/notification_item_widget.dart';
import 'widgets/notification_empty_state_widget.dart';
import 'widgets/notification_loading_widget.dart';
import 'widgets/notification_error_widget.dart';

class NotificationsPage extends ConsumerStatefulWidget {
  const NotificationsPage({super.key});

  @override
  ConsumerState<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends ConsumerState<NotificationsPage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);

    // Initialize data loading and WebSocket connection
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeNotifications();
    });
  }

  void _initializeNotifications() {
    final notifier = ref.read(notificationNotifierProvider.notifier);

    // Load initial notifications
    notifier.loadNotifications(refresh: true);
    notifier.loadUnreadCount();

    // Connect WebSocket if authenticated
    final authState = ref.read(authProvider);
    if (authState.isLoggedIn && authState.token != null) {
      notifier.connectWebSocket(authState.token!.token);
    }
  }

  void _onScroll() {
    if (_isBottom) {
      ref.read(notificationNotifierProvider.notifier).loadNotifications();
    }
  }

  bool get _isBottom {
    if (!_scrollController.hasClients) return false;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    return currentScroll >= (maxScroll * 0.9);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final notificationState = ref.watch(notificationNotifierProvider);
    final isWebSocketConnected = ref.watch(isWebSocketConnectedProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back,
            color: AppColors.brandNeutral900,
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: H3Bold(
          text: 'Notifications',
          color: AppColors.brandNeutral900,
        ),
        actions: [
          if (notificationState.unreadCount > 0)
            TextButton(
              onPressed: () {
                ref.read(notificationNotifierProvider.notifier).markAllAsRead();
              },
              child: B3Bold(
                text: 'Mark all read',
                color: AppColors.brandPrimary600,
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          // Connection status indicator
          if (!isWebSocketConnected)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.sm,
              ),
              color: AppColors.stateYellow100,
              child: Row(
                children: [
                  const Icon(
                    Icons.warning_amber_rounded,
                    size: 16,
                    color: AppColors.stateYellow600,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  B4Regular(
                    text: 'Real-time updates disconnected',
                    color: AppColors.stateYellow800,
                  ),
                ],
              ),
            ),

          // Notifications content
          Expanded(
            child: _buildNotificationContent(notificationState),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationContent(NotificationState state) {
    if (state.status == NotificationStatus.loading && state.notifications.isEmpty) {
      return const NotificationLoadingWidget();
    }

    if (state.status == NotificationStatus.failure && state.notifications.isEmpty) {
      return NotificationErrorWidget(
        error: state.error ?? 'Failed to load notifications',
        onRetry: () {
          ref.read(notificationNotifierProvider.notifier).loadNotifications(refresh: true);
        },
      );
    }

    if (state.notifications.isEmpty) {
      return const NotificationEmptyStateWidget();
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.read(notificationNotifierProvider.notifier).loadNotifications(refresh: true);
      },
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
        itemCount: state.notifications.length + (state.status == NotificationStatus.loadingMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index >= state.notifications.length) {
            // Loading more indicator
            return const Padding(
              padding: EdgeInsets.all(AppSpacing.lg),
              child: Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.brandPrimary600),
                ),
              ),
            );
          }

          final notification = state.notifications[index];
          return NotificationItemWidget(
            notification: notification,
            onTap: () {
              if (!notification.isRead) {
                ref.read(notificationNotifierProvider.notifier)
                    .markNotificationAsRead(notification.id);
              }
            },
          );
        },
      ),
    );
  }
}