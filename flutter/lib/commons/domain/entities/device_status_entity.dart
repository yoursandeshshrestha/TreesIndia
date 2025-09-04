import 'package:equatable/equatable.dart';

class DeviceStatusEntity extends Equatable {
  final bool isRegistered;
  final String? token;
  final DateTime? registeredAt;
  final DateTime? lastUsedAt;

  const DeviceStatusEntity({
    required this.isRegistered,
    this.token,
    this.registeredAt,
    this.lastUsedAt,
  });

  @override
  List<Object?> get props => [
        isRegistered,
        token,
        registeredAt,
        lastUsedAt,
      ];
}