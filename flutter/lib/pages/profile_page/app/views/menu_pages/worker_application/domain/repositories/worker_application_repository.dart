import '../entities/worker_application_entity.dart';

abstract class WorkerApplicationRepository {
  Future<WorkerApplicationEntity> submitWorkerApplication(WorkerApplicationEntity application);
  Future<WorkerApplicationEntity?> getUserApplicationStatus();
}