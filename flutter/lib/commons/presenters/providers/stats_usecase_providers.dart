import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/domain/usecases/get_projects_stats_usecase.dart';
import 'package:trees_india/commons/domain/usecases/get_vendors_stats_usecase.dart';
import 'package:trees_india/commons/domain/usecases/get_workers_stats_usecase.dart';
import 'package:trees_india/commons/presenters/providers/stats_repository_provider.dart';

final getProjectsStatsUsecaseProvider = Provider<GetProjectsStatsUsecase>((ref) {
  final statsRepository = ref.read(statsRepositoryProvider);
  return GetProjectsStatsUsecase(statsRepository: statsRepository);
});

final getVendorsStatsUsecaseProvider = Provider<GetVendorsStatsUsecase>((ref) {
  final statsRepository = ref.read(statsRepositoryProvider);
  return GetVendorsStatsUsecase(statsRepository: statsRepository);
});

final getWorkersStatsUsecaseProvider = Provider<GetWorkersStatsUsecase>((ref) {
  final statsRepository = ref.read(statsRepositoryProvider);
  return GetWorkersStatsUsecase(statsRepository: statsRepository);
});