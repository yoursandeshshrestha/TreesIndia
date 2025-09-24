import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import '../viewmodels/vendor_notifier.dart';
import '../viewmodels/vendor_state.dart';
import '../viewmodels/vendor_details_notifier.dart';
import '../viewmodels/vendor_details_state.dart';
import '../../data/datasources/vendor_remote_datasource.dart';
import '../../data/repositories/vendor_repository_impl.dart';
import '../../domain/repositories/vendor_repository.dart';
import '../../domain/usecases/get_vendors_usecase.dart';
import '../../domain/usecases/get_vendor_details_usecase.dart';

final vendorRemoteDatasourceProvider = Provider<VendorRemoteDatasource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);
  return VendorRemoteDatasourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

final vendorRepositoryProvider = Provider<VendorRepository>((ref) {
  final datasource = ref.read(vendorRemoteDatasourceProvider);
  return VendorRepositoryImpl(vendorRemoteDatasource: datasource);
});

final getVendorsUsecaseProvider = Provider<GetVendorsUsecase>((ref) {
  final repository = ref.read(vendorRepositoryProvider);
  return GetVendorsUsecase(vendorRepository: repository);
});

final vendorNotifierProvider =
    StateNotifierProvider<VendorNotifier, VendorState>((ref) {
  final getVendorsUsecase = ref.read(getVendorsUsecaseProvider);
  return VendorNotifier(getVendorsUsecase);
})
      ..registerProvider();

final getVendorDetailsUsecaseProvider = Provider<GetVendorDetailsUsecase>((ref) {
  final repository = ref.read(vendorRepositoryProvider);
  return GetVendorDetailsUsecase(vendorRepository: repository);
});

final vendorDetailsNotifierProvider =
    StateNotifierProvider<VendorDetailsNotifier, VendorDetailsState>((ref) {
  final getVendorDetailsUsecase = ref.read(getVendorDetailsUsecaseProvider);
  return VendorDetailsNotifier(getVendorDetailsUsecase: getVendorDetailsUsecase);
})
      ..registerProvider();
