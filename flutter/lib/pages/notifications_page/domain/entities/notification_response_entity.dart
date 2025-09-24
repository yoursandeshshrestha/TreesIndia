import 'package:equatable/equatable.dart';
import 'package:trees_india/commons/domain/entities/pagination_entity.dart';
import 'notification_entity.dart';

class NotificationResponseEntity extends Equatable {
  final bool success;
  final String message;
  final List<NotificationEntity> notifications;
  final PaginationEntity pagination;

  const NotificationResponseEntity({
    required this.success,
    required this.message,
    required this.notifications,
    required this.pagination,
  });

  @override
  List<Object?> get props => [
        success,
        message,
        notifications,
        pagination,
      ];
}