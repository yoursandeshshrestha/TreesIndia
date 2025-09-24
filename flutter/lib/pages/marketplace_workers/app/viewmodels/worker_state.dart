import '../../domain/entities/worker_entity.dart';
import '../../domain/entities/worker_filters_entity.dart';

enum WorkerStatus {
  initial,
  loading,
  success,
  failure,
  loadingMore,
}

class WorkerState {
  final WorkerStatus status;
  final List<WorkerEntity> workers;
  final WorkerFiltersEntity filters;
  final String? errorMessage;
  final bool hasReachedMax;

  const WorkerState({
    this.status = WorkerStatus.initial,
    this.workers = const [],
    this.filters = const WorkerFiltersEntity(),
    this.errorMessage,
    this.hasReachedMax = false,
  });

  WorkerState copyWith({
    WorkerStatus? status,
    List<WorkerEntity>? workers,
    WorkerFiltersEntity? filters,
    String? errorMessage,
    bool? hasReachedMax,
    bool clearError = false,
  }) {
    return WorkerState(
      status: status ?? this.status,
      workers: workers ?? this.workers,
      filters: filters ?? this.filters,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
    );
  }

  @override
  String toString() {
    return 'WorkerState(status: $status, workersCount: ${workers.length}, filters: $filters, hasReachedMax: $hasReachedMax)';
  }
}