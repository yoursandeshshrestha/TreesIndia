import '../../domain/entities/worker_entity.dart';

enum WorkerDetailsStatus {
  initial,
  loading,
  success,
  failure,
}

class WorkerDetailsState {
  final WorkerDetailsStatus status;
  final WorkerEntity? worker;
  final String? errorMessage;

  const WorkerDetailsState({
    this.status = WorkerDetailsStatus.initial,
    this.worker,
    this.errorMessage,
  });

  WorkerDetailsState copyWith({
    WorkerDetailsStatus? status,
    WorkerEntity? worker,
    String? errorMessage,
    bool clearError = false,
    bool clearWorker = false,
  }) {
    return WorkerDetailsState(
      status: status ?? this.status,
      worker: clearWorker ? null : (worker ?? this.worker),
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }

  @override
  String toString() {
    return 'WorkerDetailsState(status: $status, worker: ${worker?.name ?? 'null'})';
  }
}