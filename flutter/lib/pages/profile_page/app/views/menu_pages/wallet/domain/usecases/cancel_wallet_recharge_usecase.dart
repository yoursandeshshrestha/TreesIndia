import '../repositories/wallet_repository.dart';

class CancelWalletRechargeUseCase {
  final WalletRepository repository;

  CancelWalletRechargeUseCase({required this.repository});

  Future<void> call({
    required int rechargeId,
  }) async {
    return await repository.cancelWalletRecharge(
      rechargeId: rechargeId,
    );
  }
}