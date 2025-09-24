import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/presenters/providers/dio_provider.dart';
import '../../data/datasources/property_remote_datasource.dart';
import '../../data/repositories/property_repository_impl.dart';
import '../../domain/repositories/property_repository.dart';
import '../../domain/usecases/get_properties_usecase.dart';
import '../viewmodels/property_notifier.dart';
import '../viewmodels/property_state.dart';

// Datasource
final propertyRemoteDatasourceProvider = Provider<PropertyRemoteDatasource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  return PropertyRemoteDatasource(dioClient);
});

// Repository
final propertyRepositoryProvider = Provider<PropertyRepository>((ref) {
  final datasource = ref.read(propertyRemoteDatasourceProvider);
  return PropertyRepositoryImpl(datasource);
});

// Usecase
final getPropertiesUsecaseProvider = Provider<GetPropertiesUsecase>((ref) {
  final repository = ref.read(propertyRepositoryProvider);
  return GetPropertiesUsecase(repository);
});

// State notifier
final propertyNotifierProvider = StateNotifierProvider<PropertyNotifier, PropertyState>((ref) {
  final usecase = ref.read(getPropertiesUsecaseProvider);
  return PropertyNotifier(usecase);
});