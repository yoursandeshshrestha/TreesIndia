import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/data/repositories/notification_repository_impl.dart';
import 'package:trees_india/commons/domain/repositories/notification_repository.dart';
import 'package:trees_india/commons/presenters/providers/notification_datasource_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  final notificationDatasource = ref.read(notificationDatasourceProvider);

  return NotificationRepositoryImpl(
    notificationRemoteDatasource: notificationDatasource,
  );
})
    ..registerProvider();