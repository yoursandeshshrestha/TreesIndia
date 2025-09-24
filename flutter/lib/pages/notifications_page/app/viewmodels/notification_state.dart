import 'package:equatable/equatable.dart';
import '../../domain/entities/notification_entity.dart';

enum NotificationStatus {
  initial,
  loading,
  loadingMore,
  success,
  failure,
}

class NotificationState extends Equatable {
  final NotificationStatus status;
  final List<NotificationEntity> notifications;
  final int unreadCount;
  final bool isWebSocketConnected;
  final String? error;
  final bool hasReachedMax;
  final int currentPage;

  const NotificationState({
    this.status = NotificationStatus.initial,
    this.notifications = const [],
    this.unreadCount = 0,
    this.isWebSocketConnected = false,
    this.error,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  NotificationState copyWith({
    NotificationStatus? status,
    List<NotificationEntity>? notifications,
    int? unreadCount,
    bool? isWebSocketConnected,
    String? error,
    bool? hasReachedMax,
    int? currentPage,
  }) {
    return NotificationState(
      status: status ?? this.status,
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
      isWebSocketConnected: isWebSocketConnected ?? this.isWebSocketConnected,
      error: error ?? this.error,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
    );
  }

  @override
  List<Object?> get props => [
        status,
        notifications,
        unreadCount,
        isWebSocketConnected,
        error,
        hasReachedMax,
        currentPage,
      ];
}