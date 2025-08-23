import '../entities/wallet_recharge_entity.dart';
import '../repositories/wallet_repository.dart';

class InitiateWalletRechargeUseCase {
  final WalletRepository repository;

  InitiateWalletRechargeUseCase({required this.repository});

  Future<WalletRechargeResponseEntity> call({
    required WalletRechargeEntity rechargeRequest,
  }) async {
    return await repository.initiateWalletRecharge(
      rechargeRequest: rechargeRequest,
    );
  }
}