import '../entities/wallet_summary_entity.dart';
import '../repositories/wallet_repository.dart';

class GetWalletSummaryUseCase {
  final WalletRepository repository;

  GetWalletSummaryUseCase({required this.repository});

  Future<WalletSummaryEntity> call() async {
    return await repository.getWalletSummary();
  }
}