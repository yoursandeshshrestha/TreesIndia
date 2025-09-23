import '../entities/worker_entity.dart';
import '../entities/worker_filters_entity.dart';
import '../repositories/worker_repository.dart';

class GetWorkersUsecase {
  final WorkerRepository repository;

  GetWorkersUsecase({required this.repository});

  Future<List<WorkerEntity>> call(WorkerFiltersEntity filters) async {
    return await repository.getWorkers(filters);
  }
}