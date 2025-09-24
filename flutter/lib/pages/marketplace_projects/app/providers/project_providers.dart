import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';

import '../../data/datasources/project_remote_datasource.dart';
import '../../data/repositories/project_repository_impl.dart';
import '../../domain/repositories/project_repository.dart';
import '../../domain/usecases/get_projects_usecase.dart';
import '../../domain/usecases/get_project_details_usecase.dart';
import '../viewmodels/project_notifier.dart';
import '../viewmodels/project_state.dart';
import '../viewmodels/project_details_notifier.dart';
import '../viewmodels/project_details_state.dart';

final projectRemoteDatasourceProvider = Provider<ProjectRemoteDatasource>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  final errorHandler = ref.watch(errorHandlerProvider);

  return ProjectRemoteDatasourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

final projectRepositoryProvider = Provider<ProjectRepository>((ref) {
  final remoteDatasource = ref.watch(projectRemoteDatasourceProvider);

  return ProjectRepositoryImpl(
    remoteDatasource: remoteDatasource,
  );
});

final getProjectsUsecaseProvider = Provider<GetProjectsUsecase>((ref) {
  final repository = ref.watch(projectRepositoryProvider);

  return GetProjectsUsecase(repository);
});

final getProjectDetailsUsecaseProvider = Provider<GetProjectDetailsUsecase>((ref) {
  final repository = ref.watch(projectRepositoryProvider);

  return GetProjectDetailsUsecase(repository);
});

final projectNotifierProvider = StateNotifierProvider<ProjectNotifier, ProjectState>((ref) {
  final getProjectsUsecase = ref.watch(getProjectsUsecaseProvider);

  return ProjectNotifier(getProjectsUsecase);
});

final projectDetailsNotifierProvider = StateNotifierProvider.autoDispose<ProjectDetailsNotifier, ProjectDetailsState>((ref) {
  final getProjectDetailsUsecase = ref.watch(getProjectDetailsUsecaseProvider);

  return ProjectDetailsNotifier(getProjectDetailsUsecase);
});