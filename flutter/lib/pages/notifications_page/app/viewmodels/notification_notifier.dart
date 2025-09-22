import 'dart:async';
import 'dart:developer';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/get_notifications_usecase.dart';
import '../../domain/usecases/get_unread_count_usecase.dart';
import '../../domain/usecases/mark_all_read_usecase.dart';
import '../../data/services/notification_websocket_service.dart';
import 'notification_state.dart';

class NotificationNotifier extends StateNotifier<NotificationState> {
  final GetNotificationsUseCase getNotificationsUseCase;
  final GetUnreadCountUseCase getUnreadCountUseCase;
  final MarkAllReadUseCase markAllReadUseCase;
  final NotificationWebSocketService webSocketService;

  StreamSubscription<NotificationWebSocketMessage>? _messageSubscription;
  StreamSubscription<WebSocketConnectionState>? _connectionSubscription;

  NotificationNotifier({
    required this.getNotificationsUseCase,
    required this.getUnreadCountUseCase,
    required this.markAllReadUseCase,
    required this.webSocketService,
  }) : super(const NotificationState()) {
    _initializeWebSocket();
  }

  void _initializeWebSocket() {
    _connectionSubscription = webSocketService.connectionStateStream.listen(
      (connectionState) {
        final isConnected = connectionState == WebSocketConnectionState.connected;
        state = state.copyWith(isWebSocketConnected: isConnected);
        log('🔌 WebSocket connection state: $connectionState');
      },
    );

    _messageSubscription = webSocketService.messageStream.listen(
      (message) {
        _handleWebSocketMessage(message);
      },
    );
  }

  void connectWebSocket(String token) {
    webSocketService.connect(token);
  }

  void disconnectWebSocket() {
    webSocketService.disconnect();
  }

  void _handleWebSocketMessage(NotificationWebSocketMessage message) {
    log('📩 Handling WebSocket message: ${message.event}');

    switch (message.event) {
      case 'new_notification':
        _handleNewNotification(message.data);
        break;
      case 'unread_count_update':
        _handleUnreadCountUpdate(message.data);
        break;
      case 'notification_read':
        _handleNotificationRead(message.data);
        break;
      case 'all_notifications_read':
        _handleAllNotificationsRead();
        break;
      default:
        log('🤷 Unknown WebSocket event: ${message.event}');
    }
  }

  void _handleNewNotification(Map<String, dynamic> data) {
    // Note: In a real implementation, you'd convert the data to NotificationEntity
    // For now, we'll reload notifications
    loadNotifications(refresh: true);

    if (data['unread_count'] != null) {
      state = state.copyWith(unreadCount: data['unread_count'] as int);
    }
  }

  void _handleUnreadCountUpdate(Map<String, dynamic> data) {
    if (data['unread_count'] != null) {
      state = state.copyWith(unreadCount: data['unread_count'] as int);
    }
  }

  void _handleNotificationRead(Map<String, dynamic> data) {
    final notificationId = data['notification_id'] as int?;
    if (notificationId != null) {
      final updatedNotifications = state.notifications.map((notification) {
        if (notification.id == notificationId) {
          return notification.copyWith(isRead: true);
        }
        return notification;
      }).toList();

      final unreadCount = updatedNotifications.where((n) => !n.isRead).length;

      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: unreadCount,
      );
    }
  }

  void _handleAllNotificationsRead() {
    final updatedNotifications = state.notifications.map((notification) {
      return notification.copyWith(isRead: true);
    }).toList();

    state = state.copyWith(
      notifications: updatedNotifications,
      unreadCount: 0,
    );
  }

  Future<void> loadNotifications({
    bool refresh = false,
    int? limit,
    String? type,
    bool? isRead,
  }) async {
    if (refresh) {
      state = state.copyWith(
        status: NotificationStatus.loading,
        currentPage: 1,
        hasReachedMax: false,
        error: null,
      );
    } else if (state.hasReachedMax || state.status == NotificationStatus.loadingMore) {
      return;
    } else {
      state = state.copyWith(status: NotificationStatus.loadingMore);
    }

    try {
      final response = await getNotificationsUseCase(
        limit: limit ?? 20,
        page: refresh ? 1 : state.currentPage,
        type: type,
        isRead: isRead,
      );

      final notifications = refresh
          ? response.notifications
          : [...state.notifications, ...response.notifications];

      state = state.copyWith(
        status: NotificationStatus.success,
        notifications: notifications,
        hasReachedMax: !response.pagination.hasNext,
        currentPage: refresh ? 2 : state.currentPage + 1,
        error: null,
      );
    } catch (e) {
      log('❌ Error loading notifications: $e');
      state = state.copyWith(
        status: NotificationStatus.failure,
        error: e.toString(),
      );
    }
  }

  Future<void> loadUnreadCount() async {
    try {
      final response = await getUnreadCountUseCase();
      state = state.copyWith(unreadCount: response.unreadCount);
    } catch (e) {
      log('❌ Error loading unread count: $e');
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await markAllReadUseCase();
      webSocketService.markAllAsRead();

      // Update local state immediately for better UX
      _handleAllNotificationsRead();
    } catch (e) {
      log('❌ Error marking all as read: $e');
      state = state.copyWith(error: e.toString());
    }
  }

  void markNotificationAsRead(int notificationId) {
    webSocketService.markAsRead(notificationId);

    // Update local state immediately for better UX
    _handleNotificationRead({'notification_id': notificationId});
  }

  @override
  void dispose() {
    _messageSubscription?.cancel();
    _connectionSubscription?.cancel();
    webSocketService.dispose();
    super.dispose();
  }
}