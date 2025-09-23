import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/data/repositories/user_settings/user_settings_repository_impl.dart';
import 'package:trees_india/commons/domain/repositories/user_settings/user_settings_repository.dart';
import 'package:trees_india/commons/presenters/providers/user_settings_datasource_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';

final userSettingsRepositoryProvider = Provider<UserSettingsRepository>((ref) {
  final userSettingsRemoteDatasource = ref.read(userSettingsRemoteDatasourceProvider);

  return UserSettingsRepositoryImpl(
    userSettingsRemoteDatasource: userSettingsRemoteDatasource,
  );
})
    ..registerProvider();