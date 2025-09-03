import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';
import '../../data/datasources/address_remote_datasource.dart';
import '../../data/repositories/address_repository_impl.dart';
import '../../domain/repositories/address_repository.dart';
import '../../domain/usecases/get_addresses_usecase.dart';
import '../../domain/usecases/create_address_usecase.dart';
import '../../domain/usecases/update_address_usecase.dart';
import '../../domain/usecases/delete_address_usecase.dart';
import '../viewmodels/address_notifier.dart';
import '../viewmodels/address_state.dart';

final addressRemoteDataSourceProvider = Provider<AddressRemoteDataSource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);
  return AddressRemoteDataSourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

final addressRepositoryProvider = Provider<AddressRepository>((ref) {
  final remoteDataSource = ref.read(addressRemoteDataSourceProvider);
  return AddressRepositoryImpl(remoteDataSource: remoteDataSource);
});

final getAddressesUseCaseProvider = Provider((ref) {
  final repository = ref.read(addressRepositoryProvider);
  return GetAddressesUseCase(repository);
});

final createAddressUseCaseProvider = Provider((ref) {
  final repository = ref.read(addressRepositoryProvider);
  return CreateAddressUseCase(repository);
});

final updateAddressUseCaseProvider = Provider((ref) {
  final repository = ref.read(addressRepositoryProvider);
  return UpdateAddressUseCase(repository);
});

final deleteAddressUseCaseProvider = Provider((ref) {
  final repository = ref.read(addressRepositoryProvider);
  return DeleteAddressUseCase(repository);
});

final addressNotifierProvider = StateNotifierProvider<AddressNotifier, AddressState>((ref) {
  return AddressNotifier(
    getAddressesUseCase: ref.read(getAddressesUseCaseProvider),
    createAddressUseCase: ref.read(createAddressUseCaseProvider),
    updateAddressUseCase: ref.read(updateAddressUseCaseProvider),
    deleteAddressUseCase: ref.read(deleteAddressUseCaseProvider),
  );
});