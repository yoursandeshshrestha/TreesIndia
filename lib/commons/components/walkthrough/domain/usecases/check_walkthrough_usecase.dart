import '../repositories/walkthrough_repository.dart';

class CheckWalkthroughUseCase {
  final WalkthroughRepository repository;

  CheckWalkthroughUseCase(this.repository);

  Future<bool> call(String pageKey) async {
    return await repository.isWalkthroughCompleted(pageKey);
  }
}
