import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/project_filters_entity.dart';
import '../../domain/usecases/get_projects_usecase.dart';
import 'project_state.dart';

class ProjectNotifier extends StateNotifier<ProjectState> {
  final GetProjectsUsecase getProjectsUsecase;

  ProjectNotifier(this.getProjectsUsecase) : super(const ProjectState());

  Future<void> loadProjects({bool isRefresh = false}) async {
    final isInitialLoad = state.status == ProjectStatus.initial;

    if (isRefresh || isInitialLoad) {
      state = state.copyWith(
        status: ProjectStatus.loading,
        projects: isRefresh ? [] : state.projects,
        hasReachedMax: false,
        clearError: true,
      );
    } else if (state.hasReachedMax || state.status == ProjectStatus.loadingMore) {
      return;
    } else {
      state = state.copyWith(status: ProjectStatus.loadingMore);
    }

    try {
      final filters = (isRefresh || isInitialLoad)
          ? state.filters.copyWith(page: 1)
          : state.filters.copyWith(page: state.filters.page + 1);

      final newProjects = await getProjectsUsecase.call(filters);

      final allProjects = isRefresh || state.filters.page == 1
          ? newProjects
          : [...state.projects, ...newProjects];

      state = state.copyWith(
        status: ProjectStatus.success,
        projects: allProjects,
        filters: filters,
        hasReachedMax: newProjects.length < 10, // Assume page size of 10
        clearError: true,
      );
    } catch (e) {
      state = state.copyWith(
        status: ProjectStatus.failure,
        errorMessage: 'Failed to load projects: $e',
      );
    }
  }

  void setProjectType(String? projectType) {
    final newFilters = state.filters.copyWith(
      projectType: projectType,
      page: 1,
      clearProjectType: projectType == null,
    );
    state = state.copyWith(filters: newFilters);
    loadProjects(isRefresh: true);
  }

  void setStatus(String? status) {
    final newFilters = state.filters.copyWith(
      status: status,
      page: 1,
      clearStatus: status == null,
    );
    state = state.copyWith(filters: newFilters);
    loadProjects(isRefresh: true);
  }

  void setCity(String? city) {
    final newFilters = state.filters.copyWith(
      city: city,
      page: 1,
      clearCity: city == null || city.isEmpty,
    );
    state = state.copyWith(filters: newFilters);
    loadProjects(isRefresh: true);
  }

  void setState(String? state) {
    final newFilters = this.state.filters.copyWith(
      state: state,
      page: 1,
      clearState: state == null || state.isEmpty,
    );
    this.state = this.state.copyWith(filters: newFilters);
    loadProjects(isRefresh: true);
  }

  void setSortBy(ProjectSortType sortBy) {
    final newFilters = state.filters.copyWith(
      sortBy: sortBy,
      page: 1,
    );
    state = state.copyWith(filters: newFilters);
    loadProjects(isRefresh: true);
  }

  void removeFilter(String filterType, dynamic value) {
    ProjectFiltersEntity newFilters = state.filters;

    switch (filterType) {
      case 'projectType':
        newFilters = newFilters.copyWith(clearProjectType: true, page: 1);
        break;
      case 'status':
        newFilters = newFilters.copyWith(clearStatus: true, page: 1);
        break;
      case 'city':
        newFilters = newFilters.copyWith(clearCity: true, page: 1);
        break;
      case 'state':
        newFilters = newFilters.copyWith(clearState: true, page: 1);
        break;
    }

    state = state.copyWith(filters: newFilters);
    loadProjects(isRefresh: true);
  }

  void clearAllFilters() {
    const newFilters = ProjectFiltersEntity(page: 1);
    state = state.copyWith(filters: newFilters);
    loadProjects(isRefresh: true);
  }
}