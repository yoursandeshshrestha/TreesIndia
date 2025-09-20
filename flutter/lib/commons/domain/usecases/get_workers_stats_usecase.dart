import 'package:trees_india/commons/domain/entities/stats_entity.dart';
import 'package:trees_india/commons/domain/repositories/stats_repository.dart';

class GetWorkersStatsUsecase {
  final StatsRepository statsRepository;

  GetWorkersStatsUsecase({required this.statsRepository});

  Future<StatsResponseEntity<WorkerStatsEntity>> call() async {
    return await statsRepository.getWorkersStats();
  }
}