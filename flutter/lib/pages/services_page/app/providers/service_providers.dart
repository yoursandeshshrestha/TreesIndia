import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';

import '../../../../commons/presenters/providers/dio_provider.dart';
import '../../data/datasources/service_remote_datasource.dart';
import '../../data/repositories/service_repository_impl.dart';
import '../../domain/repositories/service_repository.dart';
import '../../domain/usecases/get_search_suggestions_usecase.dart';
import '../../domain/usecases/get_popular_services_usecase.dart';
import '../../domain/usecases/get_services_usecase.dart';
import '../viewmodels/search_suggestions_notifier.dart';
import '../viewmodels/search_suggestions_state.dart';
import '../viewmodels/popular_services_notifier.dart';
import '../viewmodels/popular_services_state.dart';
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

// Use Case Providers
final getSearchSuggestionsUseCaseProvider =
    Provider<GetSearchSuggestionsUseCase>((ref) {
  final repository = ref.read(serviceRepositoryProvider);
  return GetSearchSuggestionsUseCase(repository);
});

final getPopularServicesUseCaseProvider =
    Provider<GetPopularServicesUseCase>((ref) {
  final repository = ref.read(serviceRepositoryProvider);
  return GetPopularServicesUseCase(repository);
});

final getServicesUseCaseProvider = Provider<GetServicesUseCase>((ref) {
  final repository = ref.read(serviceRepositoryProvider);
  return GetServicesUseCase(repository);
});

// State Notifier Providers
final searchSuggestionsNotifierProvider =
    StateNotifierProvider<SearchSuggestionsNotifier, SearchSuggestionsState>(
        (ref) {
  final getSearchSuggestionsUseCase =
      ref.read(getSearchSuggestionsUseCaseProvider);
  return SearchSuggestionsNotifier(
      getSearchSuggestionsUseCase: getSearchSuggestionsUseCase);
});

final popularServicesNotifierProvider =
    StateNotifierProvider<PopularServicesNotifier, PopularServicesState>((ref) {
  final getPopularServicesUseCase = ref.read(getPopularServicesUseCaseProvider);
  return PopularServicesNotifier(
      getPopularServicesUseCase: getPopularServicesUseCase);
});

final serviceNotifierProvider =
    StateNotifierProvider<ServiceNotifier, ServiceState>((ref) {
  final getServicesUseCase = ref.read(getServicesUseCaseProvider);
  return ServiceNotifier(
    getServicesUseCase: getServicesUseCase,
    ref: ref,
  );
});
