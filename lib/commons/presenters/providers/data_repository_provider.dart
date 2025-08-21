import 'package:trees_india/commons/presenters/providers/centralized_datasource_provider.dart';
import 'package:trees_india/commons/presenters/providers/local_storage_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repositories/centralized_data_repository_impl.dart';

final centralizedDataRepositoryProvider =
    Provider<CentralizedDataRepositoryImpl>((ref) {
  final localStorageService = ref.read(localStorageServiceProvider);

  return CentralizedDataRepositoryImpl(
    localStorageService: localStorageService,
    datasource: ref.read(centralizedDatasourceProvider),
  );
});
