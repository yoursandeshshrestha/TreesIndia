import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/location_onboarding_provider.dart';
import '../../../../../../../../commons/presenters/providers/dio_provider.dart';
import '../../../../../../../../commons/presenters/providers/error_handler_provider.dart';
import '../../data/datasources/property_remote_datasource.dart';
import '../../data/repositories/property_repository_impl.dart';
import '../../domain/repositories/property_repository.dart';
import '../../domain/usecases/get_user_properties_usecase.dart';
import '../../domain/usecases/create_property_usecase.dart';
import '../../domain/usecases/delete_property_usecase.dart';
import '../notifiers/my_properties_notifier.dart';
import '../notifiers/property_form_notifier.dart';
import '../states/my_properties_state.dart';
import '../states/property_form_state.dart';

// Data Source Provider
final propertyRemoteDataSourceProvider =
    Provider<PropertyRemoteDataSource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);
  return PropertyRemoteDataSourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

// Repository Provider
final propertyRepositoryProvider = Provider<PropertyRepository>((ref) {
  final remoteDataSource = ref.read(propertyRemoteDataSourceProvider);
  return PropertyRepositoryImpl(remoteDataSource: remoteDataSource);
});

// Use Case Providers
final getUserPropertiesUseCaseProvider =
    Provider<GetUserPropertiesUseCase>((ref) {
  final repository = ref.read(propertyRepositoryProvider);
  return GetUserPropertiesUseCase(repository);
});

final createPropertyUseCaseProvider = Provider<CreatePropertyUseCase>((ref) {
  final repository = ref.read(propertyRepositoryProvider);
  return CreatePropertyUseCase(repository);
});

final deletePropertyUseCaseProvider = Provider<DeletePropertyUseCase>((ref) {
  final repository = ref.read(propertyRepositoryProvider);
  return DeletePropertyUseCase(repository);
});

// Notifier Providers
final myPropertiesNotifierProvider =
    StateNotifierProvider<MyPropertiesNotifier, MyPropertiesState>((ref) {
  final getUserPropertiesUseCase = ref.read(getUserPropertiesUseCaseProvider);
  final deletePropertyUseCase = ref.read(deletePropertyUseCaseProvider);
  return MyPropertiesNotifier(
    getUserPropertiesUseCase: getUserPropertiesUseCase,
    deletePropertyUseCase: deletePropertyUseCase,
  );
});

final propertyFormNotifierProvider =
    StateNotifierProvider<PropertyFormNotifier, PropertyFormState>((ref) {
  final createPropertyUseCase = ref.read(createPropertyUseCaseProvider);
  final locationOnboardingservice = ref.read(locationOnboardingServiceProvider);
  return PropertyFormNotifier(
    createPropertyUseCase: createPropertyUseCase,
    locationOnboardingService: locationOnboardingservice,
  );
});
