import '../entities/worker_entity.dart';
import '../repositories/worker_repository.dart';

class GetWorkerDetailsUsecase {
  final WorkerRepository repository;

  GetWorkerDetailsUsecase({required this.repository});

  Future<WorkerEntity> call(String workerId) async {
    return await repository.getWorkerDetails(workerId);
  }
}