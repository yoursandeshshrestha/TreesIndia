import 'package:trees_india/commons/domain/entities/stats_entity.dart';
import 'package:trees_india/commons/domain/repositories/stats_repository.dart';

class GetVendorsStatsUsecase {
  final StatsRepository statsRepository;

  GetVendorsStatsUsecase({required this.statsRepository});

  Future<StatsResponseEntity<VendorStatsEntity>> call() async {
    return await statsRepository.getVendorsStats();
  }
}