import 'package:equatable/equatable.dart';

class MarkAllReadEntity extends Equatable {
  final bool success;
  final String message;

  const MarkAllReadEntity({
    required this.success,
    required this.message,
  });

  @override
  List<Object?> get props => [
        success,
        message,
      ];
}