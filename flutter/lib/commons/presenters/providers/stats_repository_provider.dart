import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/data/repositories/stats_repository_impl.dart';
import 'package:trees_india/commons/domain/repositories/stats_repository.dart';
import 'package:trees_india/commons/presenters/providers/stats_datasource_provider.dart';

final statsRepositoryProvider = Provider<StatsRepository>((ref) {
  final statsRemoteDatasource = ref.read(statsRemoteDatasourceProvider);
  return StatsRepositoryImpl(
    statsRemoteDatasource: statsRemoteDatasource,
  );
});