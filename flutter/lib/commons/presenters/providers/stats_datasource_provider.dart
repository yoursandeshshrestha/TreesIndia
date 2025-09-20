import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/data/datasources/stats_remote_datasource.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';

final statsRemoteDatasourceProvider = Provider<StatsRemoteDatasource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);
  return StatsRemoteDatasourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});