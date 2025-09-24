import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/data/datasources/user_settings/user_settings_remote_datasource.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';

final userSettingsRemoteDatasourceProvider = Provider<UserSettingsRemoteDatasource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);

  return UserSettingsRemoteDatasource(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
})
    ..registerProvider();