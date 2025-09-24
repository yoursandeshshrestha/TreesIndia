import '../../domain/entities/worker_entity.dart';
import '../../domain/entities/worker_filters_entity.dart';
import '../../domain/repositories/worker_repository.dart';
import '../datasources/worker_remote_datasource.dart';

class WorkerRepositoryImpl implements WorkerRepository {
  final WorkerRemoteDatasource remoteDatasource;

  WorkerRepositoryImpl({required this.remoteDatasource});

  @override
  Future<List<WorkerEntity>> getWorkers(WorkerFiltersEntity filters) async {
    try {
      final response = await remoteDatasource.getWorkers(filters);
      return response.data.map((workerModel) => workerModel.toEntity()).toList();
    } catch (e) {
      throw Exception('Failed to get workers: $e');
    }
  }

  @override
  Future<WorkerEntity> getWorkerDetails(String workerId) async {
    try {
      final workerModel = await remoteDatasource.getWorkerDetails(workerId);
      return workerModel.toEntity();
    } catch (e) {
      throw Exception('Failed to get worker details: $e');
    }
  }
}