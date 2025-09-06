import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/presenters/providers/dio_provider.dart';
import '../../../../commons/presenters/providers/error_handler_provider.dart';
import '../../data/datasources/my_works_datasource.dart';
import '../../data/repositories/my_works_repository_impl.dart';
import '../../domain/repositories/my_works_repository.dart';
import '../../domain/usecases/get_assignments_usecase.dart';
import '../../domain/usecases/accept_assignment_usecase.dart';
import '../../domain/usecases/reject_assignment_usecase.dart';
import '../../domain/usecases/start_work_usecase.dart';
import '../../domain/usecases/complete_work_usecase.dart';
import '../viewmodels/my_works_notifier.dart';
import '../viewmodels/my_works_state.dart';

// Data Source Provider
final myWorksDataSourceProvider = Provider<MyWorksDataSource>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  final errorHandler = ref.watch(errorHandlerProvider);

  return MyWorksDataSource(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

// Repository Provider
final myWorksRepositoryProvider = Provider<MyWorksRepository>((ref) {
  final dataSource = ref.watch(myWorksDataSourceProvider);
  
  return MyWorksRepositoryImpl(dataSource: dataSource);
});

// Use Cases Providers
final getAssignmentsUsecaseProvider = Provider<GetAssignmentsUsecase>((ref) {
  final repository = ref.watch(myWorksRepositoryProvider);
  
  return GetAssignmentsUsecase(repository: repository);
});

final acceptAssignmentUsecaseProvider = Provider<AcceptAssignmentUsecase>((ref) {
  final repository = ref.watch(myWorksRepositoryProvider);
  
  return AcceptAssignmentUsecase(repository: repository);
});

final rejectAssignmentUsecaseProvider = Provider<RejectAssignmentUsecase>((ref) {
  final repository = ref.watch(myWorksRepositoryProvider);
  
  return RejectAssignmentUsecase(repository: repository);
});

final startWorkUsecaseProvider = Provider<StartWorkUsecase>((ref) {
  final repository = ref.watch(myWorksRepositoryProvider);
  
  return StartWorkUsecase(repository: repository);
});

final completeWorkUsecaseProvider = Provider<CompleteWorkUsecase>((ref) {
  final repository = ref.watch(myWorksRepositoryProvider);
  
  return CompleteWorkUsecase(repository: repository);
});

// Notifier Provider
final myWorksNotifierProvider = StateNotifierProvider<MyWorksNotifier, MyWorksState>((ref) {
  final getAssignmentsUsecase = ref.watch(getAssignmentsUsecaseProvider);
  final acceptAssignmentUsecase = ref.watch(acceptAssignmentUsecaseProvider);
  final rejectAssignmentUsecase = ref.watch(rejectAssignmentUsecaseProvider);
  final startWorkUsecase = ref.watch(startWorkUsecaseProvider);
  final completeWorkUsecase = ref.watch(completeWorkUsecaseProvider);
  
  return MyWorksNotifier(
    getAssignmentsUsecase: getAssignmentsUsecase,
    acceptAssignmentUsecase: acceptAssignmentUsecase,
    rejectAssignmentUsecase: rejectAssignmentUsecase,
    startWorkUsecase: startWorkUsecase,
    completeWorkUsecase: completeWorkUsecase,
  );
});