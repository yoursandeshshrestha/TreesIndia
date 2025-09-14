import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/data/datasources/notification_remote_datasource.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';

final notificationDatasourceProvider = Provider<NotificationRemoteDatasource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);

  return NotificationRemoteDatasource(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
})
    ..registerProvider();