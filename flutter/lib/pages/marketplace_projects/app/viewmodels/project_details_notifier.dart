import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/get_project_details_usecase.dart';
import 'project_details_state.dart';
import '../../../../commons/utils/error_message_helper.dart';

class ProjectDetailsNotifier extends StateNotifier<ProjectDetailsState> {
  final GetProjectDetailsUsecase getProjectDetailsUsecase;

  ProjectDetailsNotifier(this.getProjectDetailsUsecase) : super(const ProjectDetailsState());

  Future<void> loadProjectDetails(String projectId) async {
    state = state.copyWith(
      status: ProjectDetailsStatus.loading,
      clearError: true,
    );

    try {
      final project = await getProjectDetailsUsecase.call(projectId);

      state = state.copyWith(
        status: ProjectDetailsStatus.success,
        project: project,
        clearError: true,
      );
    } catch (e) {
      state = state.copyWith(
        status: ProjectDetailsStatus.failure,
        errorMessage: getErrorMessage(e, fallbackMessage: 'Unable to load project details'),
      );
    }
  }

  void clearState() {
    state = const ProjectDetailsState();
  }
}