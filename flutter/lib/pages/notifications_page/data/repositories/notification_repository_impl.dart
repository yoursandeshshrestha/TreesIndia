import '../../domain/entities/notification_response_entity.dart';
import '../../domain/entities/unread_count_entity.dart';
import '../../domain/entities/mark_all_read_entity.dart';
import '../../domain/repositories/notification_repository.dart';
import '../datasources/notification_remote_datasource.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  final NotificationRemoteDataSource remoteDataSource;

  NotificationRepositoryImpl({
    required this.remoteDataSource,
  });

  @override
  Future<NotificationResponseEntity> getNotifications({
    int? limit,
    int? page,
    String? type,
    bool? isRead,
  }) async {
    final model = await remoteDataSource.getNotifications(
      limit: limit,
      page: page,
      type: type,
      isRead: isRead,
    );
    return model.toEntity();
  }

  @override
  Future<UnreadCountEntity> getUnreadCount() async {
    final model = await remoteDataSource.getUnreadCount();
    return model.toEntity();
  }

  @override
  Future<MarkAllReadEntity> markAllAsRead() async {
    final model = await remoteDataSource.markAllAsRead();
    return model.toEntity();
  }
}