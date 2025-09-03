import 'package:trees_india/commons/presenters/providers/notification_service_provider.dart';
import 'package:trees_india/commons/utils/error_handler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final errorHandlerProvider = Provider<ErrorHandler>((ref) {
  final notificationService = ref.read(notificationServiceProvider);
  // Provide ErrorHandler instance
  return ErrorHandler(notificationService: notificationService);
});
