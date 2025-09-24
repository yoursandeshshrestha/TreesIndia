import '../entities/mark_all_read_entity.dart';
import '../repositories/notification_repository.dart';

class MarkAllReadUseCase {
  final NotificationRepository repository;

  MarkAllReadUseCase(this.repository);

  Future<MarkAllReadEntity> call() {
    return repository.markAllAsRead();
  }
}