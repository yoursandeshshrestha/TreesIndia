import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';

import '../../domain/entities/notification_entity.dart';
import '../../data/datasources/notification_remote_datasource.dart';
import '../../data/repositories/notification_repository_impl.dart';
import '../../data/services/notification_websocket_service.dart';
import '../../domain/repositories/notification_repository.dart';
import '../../domain/usecases/get_notifications_usecase.dart';
import '../../domain/usecases/get_unread_count_usecase.dart';
import '../../domain/usecases/mark_all_read_usecase.dart';
import '../viewmodels/notification_notifier.dart';
import '../viewmodels/notification_state.dart';

// Data Source Providers
final notificationRemoteDataSourceProvider =
    Provider<NotificationRemoteDataSource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);
  return NotificationRemoteDataSourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

// Repository Providers
final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  final remoteDataSource = ref.read(notificationRemoteDataSourceProvider);
  return NotificationRepositoryImpl(remoteDataSource: remoteDataSource);
});

// Use Case Providers
final getNotificationsUseCaseProvider = Provider<GetNotificationsUseCase>((ref) {
  final repository = ref.read(notificationRepositoryProvider);
  return GetNotificationsUseCase(repository);
});

final getUnreadCountUseCaseProvider = Provider<GetUnreadCountUseCase>((ref) {
  final repository = ref.read(notificationRepositoryProvider);
  return GetUnreadCountUseCase(repository);
});

final markAllReadUseCaseProvider = Provider<MarkAllReadUseCase>((ref) {
  final repository = ref.read(notificationRepositoryProvider);
  return MarkAllReadUseCase(repository);
});

// WebSocket Service Provider
final notificationWebSocketServiceProvider = Provider<NotificationWebSocketService>((ref) {
  return NotificationWebSocketService();
});

// Main Notification State Notifier Provider
final notificationNotifierProvider =
    StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  final getNotificationsUseCase = ref.read(getNotificationsUseCaseProvider);
  final getUnreadCountUseCase = ref.read(getUnreadCountUseCaseProvider);
  final markAllReadUseCase = ref.read(markAllReadUseCaseProvider);
  final webSocketService = ref.read(notificationWebSocketServiceProvider);

  return NotificationNotifier(
    getNotificationsUseCase: getNotificationsUseCase,
    getUnreadCountUseCase: getUnreadCountUseCase,
    markAllReadUseCase: markAllReadUseCase,
    webSocketService: webSocketService,
  );
});

// Convenience providers for specific state slices
final unreadCountProvider = Provider<int>((ref) {
  return ref.watch(notificationNotifierProvider).unreadCount;
});

final isWebSocketConnectedProvider = Provider<bool>((ref) {
  return ref.watch(notificationNotifierProvider).isWebSocketConnected;
});

final notificationsListProvider = Provider<List<NotificationEntity>>((ref) {
  return ref.watch(notificationNotifierProvider).notifications;
});

final notificationStatusProvider = Provider<NotificationStatus>((ref) {
  return ref.watch(notificationNotifierProvider).status;
});