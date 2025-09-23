import '../entities/worker_application_entity.dart';
import '../repositories/worker_application_repository.dart';

class SubmitWorkerApplicationUsecase {
  final WorkerApplicationRepository repository;

  SubmitWorkerApplicationUsecase(this.repository);

  Future<WorkerApplicationEntity> call(WorkerApplicationEntity application) async {
    return await repository.submitWorkerApplication(application);
  }
}