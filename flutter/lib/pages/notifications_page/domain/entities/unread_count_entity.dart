import 'package:equatable/equatable.dart';

class UnreadCountEntity extends Equatable {
  final bool success;
  final String message;
  final int unreadCount;

  const UnreadCountEntity({
    required this.success,
    required this.message,
    required this.unreadCount,
  });

  @override
  List<Object?> get props => [
        success,
        message,
        unreadCount,
      ];
}