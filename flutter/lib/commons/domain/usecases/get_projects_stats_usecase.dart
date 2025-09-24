import 'package:trees_india/commons/domain/entities/stats_entity.dart';
import 'package:trees_india/commons/domain/repositories/stats_repository.dart';

class GetProjectsStatsUsecase {
  final StatsRepository statsRepository;

  GetProjectsStatsUsecase({required this.statsRepository});

  Future<StatsResponseEntity<ProjectStatsEntity>> call() async {
    return await statsRepository.getProjectsStats();
  }
}