import '../entities/stats_entity.dart';

abstract class StatsRepository {
  Future<StatsResponseEntity<ProjectStatsEntity>> getProjectsStats();
  Future<StatsResponseEntity<VendorStatsEntity>> getVendorsStats();
  Future<StatsResponseEntity<WorkerStatsEntity>> getWorkersStats();
}