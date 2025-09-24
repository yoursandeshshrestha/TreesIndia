import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/location_onboarding_provider.dart';

import '../../../../../../../../commons/presenters/providers/dio_provider.dart';
import '../../../../../../../../commons/presenters/providers/error_handler_provider.dart';
import '../../data/datasources/vendor_remote_datasource.dart';
import '../../data/repositories/vendor_repository_impl.dart';
import '../../domain/repositories/vendor_repository.dart';
import '../../domain/usecases/create_vendor_usecase.dart';
import '../../domain/usecases/delete_vendor_usecase.dart';
import '../../domain/usecases/get_user_vendors_usecase.dart';
import '../notifiers/my_vendor_profiles_notifier.dart';
import '../notifiers/vendor_form_notifier.dart';
import '../states/my_vendor_profiles_state.dart';
import '../states/vendor_form_state.dart';

// Data Source Provider
final vendorRemoteDataSourceProvider = Provider<VendorRemoteDataSource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);
  return VendorRemoteDataSourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

// Repository Provider
final vendorRepositoryProvider = Provider<VendorRepository>((ref) {
  final remoteDataSource = ref.read(vendorRemoteDataSourceProvider);
  return VendorRepositoryImpl(remoteDataSource: remoteDataSource);
});

// Use Case Providers
final getUserVendorsUseCaseProvider = Provider<GetUserVendorsUseCase>((ref) {
  final repository = ref.read(vendorRepositoryProvider);
  return GetUserVendorsUseCase(repository);
});

final createVendorUseCaseProvider = Provider<CreateVendorUseCase>((ref) {
  final repository = ref.read(vendorRepositoryProvider);
  return CreateVendorUseCase(repository);
});

final deleteVendorUseCaseProvider = Provider<DeleteVendorUseCase>((ref) {
  final repository = ref.read(vendorRepositoryProvider);
  return DeleteVendorUseCase(repository);
});

// Notifier Providers
final myVendorProfilesNotifierProvider =
    StateNotifierProvider<MyVendorProfilesNotifier, MyVendorProfilesState>(
        (ref) {
  final getUserVendorsUseCase = ref.read(getUserVendorsUseCaseProvider);
  final deleteVendorUseCase = ref.read(deleteVendorUseCaseProvider);
  return MyVendorProfilesNotifier(
    getUserVendorsUseCase: getUserVendorsUseCase,
    deleteVendorUseCase: deleteVendorUseCase,
  );
});

final vendorFormNotifierProvider =
    StateNotifierProvider<VendorFormNotifier, VendorFormState>((ref) {
  final createVendorUseCase = ref.read(createVendorUseCaseProvider);
  final locationService = ref.read(locationOnboardingServiceProvider);
  return VendorFormNotifier(
    createVendorUseCase: createVendorUseCase,
    locationOnboardingService: locationService,
  );
});
