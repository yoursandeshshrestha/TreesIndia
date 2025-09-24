import '../entities/notification_response_entity.dart';
import '../repositories/notification_repository.dart';

class GetNotificationsUseCase {
  final NotificationRepository repository;

  GetNotificationsUseCase(this.repository);

  Future<NotificationResponseEntity> call({
    int? limit,
    int? page,
    String? type,
    bool? isRead,
  }) {
    return repository.getNotifications(
      limit: limit,
      page: page,
      type: type,
      isRead: isRead,
    );
  }
}