import '../entities/worker_application_entity.dart';
import '../repositories/worker_application_repository.dart';

class GetUserApplicationStatusUsecase {
  final WorkerApplicationRepository repository;

  GetUserApplicationStatusUsecase(this.repository);

  Future<WorkerApplicationEntity?> call() async {
    return await repository.getUserApplicationStatus();
  }
}