import '../repositories/wallet_repository.dart';

class CompleteWalletRechargeUseCase {
  final WalletRepository repository;

  CompleteWalletRechargeUseCase({required this.repository});

  Future<void> call({
    required int rechargeId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    return await repository.completeWalletRecharge(
      rechargeId: rechargeId,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature,
    );
  }
}