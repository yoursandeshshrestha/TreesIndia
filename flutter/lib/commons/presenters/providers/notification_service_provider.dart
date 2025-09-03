import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../utils/services/notification_service.dart';

final notificationServiceProvider = Provider<NotificationService>((ref) {
  return NotificationService();
});
