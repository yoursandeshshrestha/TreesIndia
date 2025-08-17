import '../repositories/walkthrough_repository.dart';

class CompleteWalkthroughUseCase {
  final WalkthroughRepository repository;

  CompleteWalkthroughUseCase(this.repository);

  Future<void> call(String pageKey) async {
    await repository.completeWalkthroughForPage(pageKey);
  }
}
