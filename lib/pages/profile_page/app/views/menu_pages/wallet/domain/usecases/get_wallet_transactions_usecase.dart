import '../entities/wallet_transactions_response_entity.dart';
import '../repositories/wallet_repository.dart';

class GetWalletTransactionsUseCase {
  final WalletRepository repository;

  GetWalletTransactionsUseCase({required this.repository});

  Future<WalletTransactionsResponseEntity> call({
    int page = 1,
    int limit = 10,
  }) async {
    return await repository.getWalletTransactions(page: page, limit: limit);
  }
}