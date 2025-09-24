import 'package:trees_india/commons/domain/repositories/stats_repository.dart';
import 'package:trees_india/commons/domain/entities/stats_entity.dart';
import '../datasources/stats_remote_datasource.dart';

class StatsRepositoryImpl implements StatsRepository {
  final StatsRemoteDatasource statsRemoteDatasource;

  StatsRepositoryImpl({
    required this.statsRemoteDatasource,
  });

  @override
  Future<StatsResponseEntity<ProjectStatsEntity>> getProjectsStats() async {
    try {
      final response = await statsRemoteDatasource.getProjectsStats();
      return response.toEntity<ProjectStatsEntity>((model) => model.toEntity());
    } catch (e) {
      throw Exception('Failed to get project stats: $e');
    }
  }

  @override
  Future<StatsResponseEntity<VendorStatsEntity>> getVendorsStats() async {
    try {
      final response = await statsRemoteDatasource.getVendorsStats();
      return response.toEntity<VendorStatsEntity>((model) => model.toEntity());
    } catch (e) {
      throw Exception('Failed to get vendor stats: $e');
    }
  }

  @override
  Future<StatsResponseEntity<WorkerStatsEntity>> getWorkersStats() async {
    try {
      final response = await statsRemoteDatasource.getWorkersStats();
      return response.toEntity<WorkerStatsEntity>((model) => model.toEntity());
    } catch (e) {
      throw Exception('Failed to get worker stats: $e');
    }
  }
}