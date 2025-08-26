import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';
import '../../../../commons/presenters/providers/dio_provider.dart';
import '../../data/datasources/subcategory_remote_datasource.dart';
import '../../data/repositories/subcategory_repository_impl.dart';
import '../../domain/repositories/subcategory_repository.dart';
import '../../domain/usecases/get_subcategories_usecase.dart';
import '../viewmodels/subcategory_notifier.dart';
import '../viewmodels/subcategory_state.dart';

// Data Source Provider
final subcategoryRemoteDataSourceProvider =
    Provider<SubcategoryRemoteDataSource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);
  return SubcategoryRemoteDataSourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

// Repository Provider
final subcategoryRepositoryProvider = Provider<SubcategoryRepository>((ref) {
  final remoteDataSource = ref.read(subcategoryRemoteDataSourceProvider);
  return SubcategoryRepositoryImpl(remoteDataSource: remoteDataSource);
});

// Use Case Provider
final getSubcategoriesUseCaseProvider = Provider<GetSubcategoriesUseCase>((ref) {
  final repository = ref.read(subcategoryRepositoryProvider);
  return GetSubcategoriesUseCase(repository);
});

// State Notifier Provider
final subcategoryNotifierProvider =
    StateNotifierProvider<SubcategoryNotifier, SubcategoryState>((ref) {
  final getSubcategoriesUseCase = ref.read(getSubcategoriesUseCaseProvider);
  return SubcategoryNotifier(getSubcategoriesUseCase: getSubcategoriesUseCase);
});