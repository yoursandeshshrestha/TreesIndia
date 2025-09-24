import '../../domain/entities/worker_application_entity.dart';
import '../../domain/repositories/worker_application_repository.dart';
import '../datasources/worker_application_remote_datasource.dart';
import '../models/worker_application_model.dart';

class WorkerApplicationRepositoryImpl implements WorkerApplicationRepository {
  final WorkerApplicationRemoteDataSource remoteDataSource;

  WorkerApplicationRepositoryImpl({
    required this.remoteDataSource,
  });

  @override
  Future<WorkerApplicationEntity> submitWorkerApplication(WorkerApplicationEntity application) async {
    final applicationModel = WorkerApplicationModel.fromEntity(application);
    final response = await remoteDataSource.submitWorkerApplication(applicationModel);
    return response.data.toEntity();
  }

  @override
  Future<WorkerApplicationEntity?> getUserApplicationStatus() async {
    final response = await remoteDataSource.getUserApplicationStatus();
    return response.data?.toEntity();
  }
}