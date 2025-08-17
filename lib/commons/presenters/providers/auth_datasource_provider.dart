import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/data/datasources/auth_datasource.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';

final authDatasourceProvider = Provider<AuthDatasource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);

  return AuthDatasource(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});
