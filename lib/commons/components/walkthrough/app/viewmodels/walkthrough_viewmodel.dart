import 'package:trees_india/commons/components/walkthrough/domain/entities/walkthrough_manager_entity.dart';
import 'package:trees_india/commons/components/walkthrough/domain/usecases/check_walkthrough_usecase.dart';
import 'package:trees_india/commons/components/walkthrough/domain/usecases/complete_walkthrough_usecase.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class WalkthroughViewModel
    extends StateNotifier<AsyncValue<WalkthroughManagerEntity>>
    with ResettableNotifier<AsyncValue<WalkthroughManagerEntity>> {
  final CheckWalkthroughUseCase _checkWalkthroughUseCase;
  final CompleteWalkthroughUseCase _completeWalkthroughUseCase;

  WalkthroughViewModel(
      this._checkWalkthroughUseCase, this._completeWalkthroughUseCase)
      : super(const AsyncLoading());

  Future<void> loadWalkthroughStatus(String pageKey) async {
    try {
      final isCompleted = await _checkWalkthroughUseCase(pageKey);
      state = AsyncValue.data(
        WalkthroughManagerEntity(pageKey: pageKey, isCompleted: isCompleted),
      );
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  void nextStep() {
    print(state.whenData((entity) => entity.currentStep));
    state = state.whenData((entity) {
      final newStep = entity.currentStep + 1;
      return entity.copyWith(currentStep: newStep);
    });
    print(state.whenData((entity) => entity.currentStep));
  }

  int get currentStep => state.maybeWhen(
        data: (entity) => entity.currentStep,
        orElse: () => 0,
      );

  Future<void> completeWalkthrough(String pageKey) async {
    try {
      await _completeWalkthroughUseCase(pageKey);
      state = AsyncValue.data(
        WalkthroughManagerEntity(pageKey: pageKey, isCompleted: true),
      );
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  @override
  void reset() {
    state = const AsyncLoading();
  }
}
