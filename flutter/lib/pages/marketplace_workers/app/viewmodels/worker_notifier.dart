import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/worker_filters_entity.dart';
import '../../domain/usecases/get_workers_usecase.dart';
import 'worker_state.dart';
import '../../../../commons/utils/error_message_helper.dart';

class WorkerNotifier extends StateNotifier<WorkerState> {
  final GetWorkersUsecase getWorkersUsecase;

  WorkerNotifier(this.getWorkersUsecase) : super(const WorkerState());

  Future<void> loadWorkers({bool isRefresh = false}) async {
    final isInitialLoad = state.status == WorkerStatus.initial;

    if (isRefresh || isInitialLoad) {
      state = state.copyWith(
        status: WorkerStatus.loading,
        workers: isRefresh ? [] : state.workers,
        hasReachedMax: false,
        clearError: true,
      );
    } else if (state.hasReachedMax || state.status == WorkerStatus.loadingMore) {
      return;
    } else {
      state = state.copyWith(status: WorkerStatus.loadingMore);
    }

    try {
      final filters = (isRefresh || isInitialLoad)
          ? state.filters.copyWith(page: 1)
          : state.filters.copyWith(page: state.filters.page + 1);

      final newWorkers = await getWorkersUsecase.call(filters);

      final allWorkers = isRefresh || state.filters.page == 1
          ? newWorkers
          : [...state.workers, ...newWorkers];

      state = state.copyWith(
        status: WorkerStatus.success,
        workers: allWorkers,
        filters: filters,
        hasReachedMax: newWorkers.length < 12, // Assume page size of 12
        clearError: true,
      );
    } catch (e) {
      state = state.copyWith(
        status: WorkerStatus.failure,
        errorMessage: getErrorMessage(e, fallbackMessage: 'Unable to load workers'),
      );
    }
  }

  void setWorkerType(String? workerType) {
    final newFilters = state.filters.copyWith(
      workerType: workerType,
      page: 1,
      clearWorkerType: workerType == null,
    );
    state = state.copyWith(filters: newFilters);
    loadWorkers(isRefresh: true);
  }

  void setSkills(List<String>? skills) {
    final newFilters = state.filters.copyWith(
      skills: skills,
      page: 1,
      clearSkills: skills == null || skills.isEmpty,
    );
    state = state.copyWith(filters: newFilters);
    loadWorkers(isRefresh: true);
  }

  void setExperienceRange(int? minExperience, int? maxExperience) {
    final newFilters = state.filters.copyWith(
      minExperience: minExperience,
      maxExperience: maxExperience,
      page: 1,
      clearMinExperience: minExperience == null,
      clearMaxExperience: maxExperience == null,
    );
    state = state.copyWith(filters: newFilters);
    loadWorkers(isRefresh: true);
  }

  void setSearch(String? search) {
    final newFilters = state.filters.copyWith(
      search: search,
      page: 1,
      clearSearch: search == null || search.isEmpty,
    );
    state = state.copyWith(filters: newFilters);
    loadWorkers(isRefresh: true);
  }

  void setSortBy(WorkerSortType sortBy) {
    final newFilters = state.filters.copyWith(
      sortBy: sortBy,
      page: 1,
    );
    state = state.copyWith(filters: newFilters);
    loadWorkers(isRefresh: true);
  }

  void removeFilter(String filterType, dynamic value) {
    WorkerFiltersEntity newFilters = state.filters;

    switch (filterType) {
      case 'workerType':
        newFilters = newFilters.copyWith(clearWorkerType: true, page: 1);
        break;
      case 'skills':
        if (value is String) {
          final currentSkills = List<String>.from(newFilters.skills ?? []);
          currentSkills.remove(value);
          newFilters = newFilters.copyWith(
            skills: currentSkills.isEmpty ? null : currentSkills,
            clearSkills: currentSkills.isEmpty,
            page: 1,
          );
        }
        break;
      case 'experience':
        newFilters = newFilters.copyWith(
          clearMinExperience: true,
          clearMaxExperience: true,
          page: 1,
        );
        break;
      case 'search':
        newFilters = newFilters.copyWith(clearSearch: true, page: 1);
        break;
    }

    state = state.copyWith(filters: newFilters);
    loadWorkers(isRefresh: true);
  }

  void clearAllFilters() {
    const newFilters = WorkerFiltersEntity(page: 1);
    state = state.copyWith(filters: newFilters);
    loadWorkers(isRefresh: true);
  }
}