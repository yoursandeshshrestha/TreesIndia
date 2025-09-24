import '../entities/notification_response_entity.dart';
import '../entities/unread_count_entity.dart';
import '../entities/mark_all_read_entity.dart';

abstract class NotificationRepository {
  Future<NotificationResponseEntity> getNotifications({
    int? limit,
    int? page,
    String? type,
    bool? isRead,
  });

  Future<UnreadCountEntity> getUnreadCount();

  Future<MarkAllReadEntity> markAllAsRead();
}