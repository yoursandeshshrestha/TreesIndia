import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';
import '../../../../commons/presenters/providers/dio_provider.dart';
import '../../data/datasources/service_remote_datasource.dart';
import '../../data/repositories/service_repository_impl.dart';
import '../../domain/repositories/service_repository.dart';
import '../../domain/usecases/get_services_usecase.dart';
import '../viewmodels/service_notifier.dart';
import '../viewmodels/service_state.dart';

// Data Source Provider
final serviceRemoteDataSourceProvider =
    Provider<ServiceRemoteDataSource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);
  return ServiceRemoteDataSourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

// Repository Provider
final serviceRepositoryProvider = Provider<ServiceRepository>((ref) {
  final remoteDataSource = ref.read(serviceRemoteDataSourceProvider);
  return ServiceRepositoryImpl(remoteDataSource: remoteDataSource);
});

// Use Case Provider
final getServicesUseCaseProvider = Provider<GetServicesUseCase>((ref) {
  final repository = ref.read(serviceRepositoryProvider);
  return GetServicesUseCase(repository);
});

// State Notifier Provider
final serviceNotifierProvider =
    StateNotifierProvider<ServiceNotifier, ServiceState>((ref) {
  final getServicesUseCase = ref.read(getServicesUseCaseProvider);
  return ServiceNotifier(
    getServicesUseCase: getServicesUseCase,
    ref: ref,
  );
});