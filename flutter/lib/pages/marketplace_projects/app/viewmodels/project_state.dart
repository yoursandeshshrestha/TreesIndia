import '../../domain/entities/project_entity.dart';
import '../../domain/entities/project_filters_entity.dart';

enum ProjectStatus {
  initial,
  loading,
  loadingMore,
  success,
  failure,
}

class ProjectState {
  final ProjectStatus status;
  final List<ProjectEntity> projects;
  final ProjectFiltersEntity filters;
  final bool hasReachedMax;
  final String? errorMessage;

  const ProjectState({
    this.status = ProjectStatus.initial,
    this.projects = const [],
    this.filters = const ProjectFiltersEntity(),
    this.hasReachedMax = false,
    this.errorMessage,
  });

  ProjectState copyWith({
    ProjectStatus? status,
    List<ProjectEntity>? projects,
    ProjectFiltersEntity? filters,
    bool? hasReachedMax,
    String? errorMessage,
    bool clearError = false,
  }) {
    return ProjectState(
      status: status ?? this.status,
      projects: projects ?? this.projects,
      filters: filters ?? this.filters,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }

  @override
  String toString() {
    return 'ProjectState(status: $status, projectsCount: ${projects.length}, hasReachedMax: $hasReachedMax, errorMessage: $errorMessage)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ProjectState &&
        other.status == status &&
        other.projects == projects &&
        other.filters == filters &&
        other.hasReachedMax == hasReachedMax &&
        other.errorMessage == errorMessage;
  }

  @override
  int get hashCode {
    return Object.hash(
      status,
      projects,
      filters,
      hasReachedMax,
      errorMessage,
    );
  }
}