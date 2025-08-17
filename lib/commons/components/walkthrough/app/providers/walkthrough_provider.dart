import 'package:trees_india/commons/components/walkthrough/domain/entities/walkthrough_manager_entity.dart';
import 'package:trees_india/commons/presenters/providers/data_repository_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/walkthrough/data/repositories_impl/walkthrough_repository_impl.dart';
import 'package:trees_india/commons/components/walkthrough/domain/repositories/walkthrough_repository.dart';
import 'package:trees_india/commons/components/walkthrough/domain/usecases/check_walkthrough_usecase.dart';
import 'package:trees_india/commons/components/walkthrough/domain/usecases/complete_walkthrough_usecase.dart';
import 'package:trees_india/commons/utils/services/centralized_local_storage_service.dart';
import 'package:trees_india/commons/components/walkthrough/app/viewmodels/walkthrough_viewmodel.dart';

// Repository provider
final walkthroughRepositoryProvider = Provider<WalkthroughRepository>((ref) {
  final storageService = CentralizedLocalStorageService();
  return WalkthroughRepositoryImpl(
      storageService, ref.read(centralizedDataRepositoryProvider));
});

// Use case providers
final checkWalkthroughUseCaseProvider = Provider((ref) {
  final repository = ref.watch(walkthroughRepositoryProvider);
  return CheckWalkthroughUseCase(repository);
});

final completeWalkthroughUseCaseProvider = Provider((ref) {
  final repository = ref.watch(walkthroughRepositoryProvider);
  return CompleteWalkthroughUseCase(repository);
});

// Walkthrough ViewModel provider
final walkthroughViewModelProvider = StateNotifierProvider<WalkthroughViewModel,
    AsyncValue<WalkthroughManagerEntity>>((ref) {
  final checkUseCase = ref.watch(checkWalkthroughUseCaseProvider);
  final completeUseCase = ref.watch(completeWalkthroughUseCaseProvider);
  return WalkthroughViewModel(checkUseCase, completeUseCase);
})
  ..registerProvider();
