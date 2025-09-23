import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../../../../commons/presenters/providers/dio_provider.dart';
import '../../../../../../../../commons/presenters/providers/error_handler_provider.dart';
import '../states/worker_application_state.dart';
import '../notifiers/worker_application_notifier.dart';
import '../../domain/usecases/submit_worker_application_usecase.dart';
import '../../domain/usecases/get_user_application_status_usecase.dart';
import '../../domain/repositories/worker_application_repository.dart';
import '../../data/repositories/worker_application_repository_impl.dart';
import '../../data/datasources/worker_application_remote_datasource.dart';

// DataSource Provider
final workerApplicationRemoteDataSourceProvider = Provider<WorkerApplicationRemoteDataSource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);

  return WorkerApplicationRemoteDataSourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

// Repository Provider
final workerApplicationRepositoryProvider = Provider<WorkerApplicationRepository>((ref) {
  final remoteDataSource = ref.read(workerApplicationRemoteDataSourceProvider);

  return WorkerApplicationRepositoryImpl(
    remoteDataSource: remoteDataSource,
  );
});

// Use Cases Providers
final submitWorkerApplicationUsecaseProvider = Provider<SubmitWorkerApplicationUsecase>((ref) {
  final repository = ref.read(workerApplicationRepositoryProvider);
  return SubmitWorkerApplicationUsecase(repository);
});

final getUserApplicationStatusUsecaseProvider = Provider<GetUserApplicationStatusUsecase>((ref) {
  final repository = ref.read(workerApplicationRepositoryProvider);
  return GetUserApplicationStatusUsecase(repository);
});

// Main Notifier Provider
final workerApplicationNotifierProvider = StateNotifierProvider<WorkerApplicationNotifier, WorkerApplicationState>((ref) {
  final submitUsecase = ref.read(submitWorkerApplicationUsecaseProvider);
  final getStatusUsecase = ref.read(getUserApplicationStatusUsecaseProvider);

  return WorkerApplicationNotifier(
    submitWorkerApplicationUsecase: submitUsecase,
    getUserApplicationStatusUsecase: getStatusUsecase,
  );
});