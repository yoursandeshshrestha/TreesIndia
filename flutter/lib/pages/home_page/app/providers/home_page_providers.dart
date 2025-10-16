import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';

import '../../../../commons/presenters/providers/dio_provider.dart';
import '../../data/datasources/category_remote_datasource.dart';
import '../../data/datasources/subcategory_remote_datasource.dart';
import '../../data/repositories/category_repository_impl.dart';
import '../../data/repositories/subcategory_repository_impl.dart';
import '../../domain/repositories/category_repository.dart';
import '../../domain/repositories/subcategory_repository.dart';
import '../../domain/usecases/get_categories_usecase.dart';
import '../../domain/usecases/get_subcategories_usecase.dart';
import '../../../services_page/domain/usecases/get_search_suggestions_usecase.dart';
import '../../../services_page/domain/usecases/get_popular_services_usecase.dart';
import '../../../services_page/app/providers/service_providers.dart';
import '../../../rental_and_properties/domain/usecases/get_properties_usecase.dart';
import '../../../rental_and_properties/app/providers/property_providers.dart';
import '../viewmodels/home_page_notifier.dart';
import '../viewmodels/home_page_state.dart';

// Data Source Providers
final categoryRemoteDataSourceProvider =
    Provider<CategoryRemoteDataSource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);
  return CategoryRemoteDataSourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

final subcategoryRemoteDataSourceProvider =
    Provider<SubcategoryRemoteDataSource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);
  return SubcategoryRemoteDataSourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

// Repository Providers
final categoryRepositoryProvider = Provider<CategoryRepository>((ref) {
  final remoteDataSource = ref.read(categoryRemoteDataSourceProvider);
  return CategoryRepositoryImpl(remoteDataSource: remoteDataSource);
});

final subcategoryRepositoryProvider = Provider<SubcategoryRepository>((ref) {
  final remoteDataSource = ref.read(subcategoryRemoteDataSourceProvider);
  return SubcategoryRepositoryImpl(remoteDataSource: remoteDataSource);
});

// Use Case Providers
final getCategoriesUseCaseProvider = Provider<GetCategoriesUseCase>((ref) {
  final repository = ref.read(categoryRepositoryProvider);
  return GetCategoriesUseCase(repository);
});

final getSubcategoriesUseCaseProvider =
    Provider<GetSubcategoriesUseCase>((ref) {
  final repository = ref.read(subcategoryRepositoryProvider);
  return GetSubcategoriesUseCase(repository);
});

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

// Property Use Case Provider (from rental_and_properties module)
final getPropertiesUseCaseProviderForHome =
    Provider<GetPropertiesUsecase>((ref) {
  final repository = ref.read(propertyRepositoryProvider);
  return GetPropertiesUsecase(repository);
});

// Main Home Page State Notifier Provider
final homePageNotifierProvider =
    StateNotifierProvider<HomePageNotifier, HomePageState>((ref) {
  final getCategoriesUseCase = ref.read(getCategoriesUseCaseProvider);
  final getSubcategoriesUseCase = ref.read(getSubcategoriesUseCaseProvider);
  final getSearchSuggestionsUseCase =
      ref.read(getSearchSuggestionsUseCaseProvider);
  final getPopularServicesUseCase = ref.read(getPopularServicesUseCaseProvider);
  final getPropertiesUseCase = ref.read(getPropertiesUseCaseProviderForHome);

  return HomePageNotifier(
    getCategoriesUseCase: getCategoriesUseCase,
    getSubcategoriesUseCase: getSubcategoriesUseCase,
    getSearchSuggestionsUseCase: getSearchSuggestionsUseCase,
    getPopularServicesUseCase: getPopularServicesUseCase,
    getPropertiesUsecase: getPropertiesUseCase,
  );
});
