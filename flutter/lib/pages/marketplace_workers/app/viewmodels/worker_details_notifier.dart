import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/get_worker_details_usecase.dart';
import 'worker_details_state.dart';

class WorkerDetailsNotifier extends StateNotifier<WorkerDetailsState> {
  final GetWorkerDetailsUsecase getWorkerDetailsUsecase;

  WorkerDetailsNotifier(this.getWorkerDetailsUsecase) : super(const WorkerDetailsState());

  Future<void> getWorkerDetails(String workerId) async {
    state = state.copyWith(
      status: WorkerDetailsStatus.loading,
      clearError: true,
    );

    try {
      final worker = await getWorkerDetailsUsecase.call(workerId);
      state = state.copyWith(
        status: WorkerDetailsStatus.success,
        worker: worker,
        clearError: true,
      );
    } catch (e) {
      state = state.copyWith(
        status: WorkerDetailsStatus.failure,
        errorMessage: 'Failed to load worker details: $e',
      );
    }
  }

  void clearWorkerDetails() {
    state = state.copyWith(
      status: WorkerDetailsStatus.initial,
      clearWorker: true,
      clearError: true,
    );
  }
}