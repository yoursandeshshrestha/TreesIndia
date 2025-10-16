import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/location_onboarding_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import '../../../../../../../../commons/presenters/providers/dio_provider.dart';
import '../../../../../../../../commons/presenters/providers/error_handler_provider.dart';
import '../states/broker_application_state.dart';
import '../notifiers/broker_application_notifier.dart';
import '../../domain/usecases/submit_broker_application_usecase.dart';
import '../../domain/usecases/get_broker_application_status_usecase.dart';
import '../../domain/repositories/broker_application_repository.dart';
import '../../data/repositories/broker_application_repository_impl.dart';
import '../../data/datasources/broker_application_remote_datasource.dart';

// DataSource Provider
final brokerApplicationRemoteDataSourceProvider =
    Provider<BrokerApplicationRemoteDataSource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);

  return BrokerApplicationRemoteDataSourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
})
      ..registerProvider();

// Repository Provider
final brokerApplicationRepositoryProvider =
    Provider<BrokerApplicationRepository>((ref) {
  final remoteDataSource = ref.read(brokerApplicationRemoteDataSourceProvider);

  return BrokerApplicationRepositoryImpl(
    remoteDataSource: remoteDataSource,
  );
})
      ..registerProvider();

// Use Cases Providers
final submitBrokerApplicationUsecaseProvider =
    Provider<SubmitBrokerApplicationUsecase>((ref) {
  final repository = ref.read(brokerApplicationRepositoryProvider);
  return SubmitBrokerApplicationUsecase(repository);
})
      ..registerProvider();

final getBrokerApplicationStatusUsecaseProvider =
    Provider<GetBrokerApplicationStatusUsecase>((ref) {
  final repository = ref.read(brokerApplicationRepositoryProvider);
  return GetBrokerApplicationStatusUsecase(repository);
})
      ..registerProvider();

// Main Notifier Provider
final brokerApplicationNotifierProvider =
    StateNotifierProvider<BrokerApplicationNotifier, BrokerApplicationState>(
        (ref) {
  final submitUsecase = ref.read(submitBrokerApplicationUsecaseProvider);
  final getStatusUsecase = ref.read(getBrokerApplicationStatusUsecaseProvider);
  final locationOnboardingService = ref.read(locationOnboardingServiceProvider);

  return BrokerApplicationNotifier(
    submitBrokerApplicationUsecase: submitUsecase,
    getBrokerApplicationStatusUsecase: getStatusUsecase,
    locationOnboardingService: locationOnboardingService
  );
})
      ..registerProvider();
