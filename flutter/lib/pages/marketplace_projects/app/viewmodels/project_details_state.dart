import '../../domain/entities/project_entity.dart';

enum ProjectDetailsStatus {
  initial,
  loading,
  success,
  failure,
}

class ProjectDetailsState {
  final ProjectDetailsStatus status;
  final ProjectEntity? project;
  final String? errorMessage;

  const ProjectDetailsState({
    this.status = ProjectDetailsStatus.initial,
    this.project,
    this.errorMessage,
  });

  ProjectDetailsState copyWith({
    ProjectDetailsStatus? status,
    ProjectEntity? project,
    String? errorMessage,
    bool clearError = false,
  }) {
    return ProjectDetailsState(
      status: status ?? this.status,
      project: project ?? this.project,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }

  @override
  String toString() {
    return 'ProjectDetailsState(status: $status, projectId: ${project?.id}, errorMessage: $errorMessage)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ProjectDetailsState &&
        other.status == status &&
        other.project == project &&
        other.errorMessage == errorMessage;
  }

  @override
  int get hashCode {
    return Object.hash(
      status,
      project,
      errorMessage,
    );
  }
}