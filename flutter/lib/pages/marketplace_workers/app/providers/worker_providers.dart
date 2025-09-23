import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';

import '../../data/datasources/worker_remote_datasource.dart';
import '../../data/repositories/worker_repository_impl.dart';
import '../../domain/repositories/worker_repository.dart';
import '../../domain/usecases/get_workers_usecase.dart';
import '../../domain/usecases/get_worker_details_usecase.dart';
import '../viewmodels/worker_notifier.dart';
import '../viewmodels/worker_details_notifier.dart';
import '../viewmodels/worker_state.dart';
import '../viewmodels/worker_details_state.dart';

// Datasource Provider
final workerRemoteDatasourceProvider = Provider<WorkerRemoteDatasource>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  final errorHandler = ref.watch(errorHandlerProvider);

  return WorkerRemoteDatasourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

// Repository Provider
final workerRepositoryProvider = Provider<WorkerRepository>((ref) {
  final remoteDatasource = ref.watch(workerRemoteDatasourceProvider);

  return WorkerRepositoryImpl(
    remoteDatasource: remoteDatasource,
  );
});

// UseCase Providers
final getWorkersUsecaseProvider = Provider<GetWorkersUsecase>((ref) {
  final repository = ref.watch(workerRepositoryProvider);

  return GetWorkersUsecase(repository: repository);
});

final getWorkerDetailsUsecaseProvider = Provider<GetWorkerDetailsUsecase>((ref) {
  final repository = ref.watch(workerRepositoryProvider);

  return GetWorkerDetailsUsecase(repository: repository);
});

// State Notifier Providers
final workerNotifierProvider = StateNotifierProvider<WorkerNotifier, WorkerState>((ref) {
  final getWorkersUsecase = ref.watch(getWorkersUsecaseProvider);

  return WorkerNotifier(getWorkersUsecase);
});

final workerDetailsNotifierProvider = StateNotifierProvider<WorkerDetailsNotifier, WorkerDetailsState>((ref) {
  final getWorkerDetailsUsecase = ref.watch(getWorkerDetailsUsecaseProvider);

  return WorkerDetailsNotifier(getWorkerDetailsUsecase);
});