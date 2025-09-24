import '../entities/unread_count_entity.dart';
import '../repositories/notification_repository.dart';

class GetUnreadCountUseCase {
  final NotificationRepository repository;

  GetUnreadCountUseCase(this.repository);

  Future<UnreadCountEntity> call() {
    return repository.getUnreadCount();
  }
}