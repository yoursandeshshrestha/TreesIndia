import '../entities/worker_entity.dart';
import '../entities/worker_filters_entity.dart';

abstract class WorkerRepository {
  Future<List<WorkerEntity>> getWorkers(WorkerFiltersEntity filters);
  Future<WorkerEntity> getWorkerDetails(String workerId);
}