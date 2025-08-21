import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/data/datasources/login_datasource.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';

final loginDatasourceProvider = Provider<LoginDatasource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);

  return LoginDatasource(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});
