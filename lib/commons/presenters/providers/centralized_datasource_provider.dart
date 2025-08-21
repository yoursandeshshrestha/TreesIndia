import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';

import '../../data/datasources/centralized_datasource.dart';

final centralizedDatasourceProvider = Provider<CentralizedDatasource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);

  return CentralizedDatasource(
      dioClient: dioClient, errorHandler: errorHandler);
});
