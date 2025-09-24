import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/location_onboarding_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
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
final workerApplicationRemoteDataSourceProvider =
    Provider<WorkerApplicationRemoteDataSource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);

  return WorkerApplicationRemoteDataSourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
})
      ..registerProvider();

// Repository Provider
final workerApplicationRepositoryProvider =
    Provider<WorkerApplicationRepository>((ref) {
  final remoteDataSource = ref.read(workerApplicationRemoteDataSourceProvider);

  return WorkerApplicationRepositoryImpl(
    remoteDataSource: remoteDataSource,
  );
})
      ..registerProvider();

// Use Cases Providers
final submitWorkerApplicationUsecaseProvider =
    Provider<SubmitWorkerApplicationUsecase>((ref) {
  final repository = ref.read(workerApplicationRepositoryProvider);
  return SubmitWorkerApplicationUsecase(repository);
})
      ..registerProvider();

final getUserApplicationStatusUsecaseProvider =
    Provider<GetUserApplicationStatusUsecase>((ref) {
  final repository = ref.read(workerApplicationRepositoryProvider);
  return GetUserApplicationStatusUsecase(repository);
})
      ..registerProvider();

// Main Notifier Provider
final workerApplicationNotifierProvider =
    StateNotifierProvider<WorkerApplicationNotifier, WorkerApplicationState>(
        (ref) {
  final submitUsecase = ref.read(submitWorkerApplicationUsecaseProvider);
  final getStatusUsecase = ref.read(getUserApplicationStatusUsecaseProvider);
  final locationOnboardingService = ref.read(locationOnboardingServiceProvider);

  return WorkerApplicationNotifier(
    submitWorkerApplicationUsecase: submitUsecase,
    getUserApplicationStatusUsecase: getStatusUsecase,
    locationOnboardingService: locationOnboardingService
  );
})
      ..registerProvider();
