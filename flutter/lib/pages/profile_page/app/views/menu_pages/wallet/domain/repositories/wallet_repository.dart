import '../entities/wallet_summary_entity.dart';
import '../entities/wallet_transactions_response_entity.dart';
import '../entities/wallet_recharge_entity.dart';

abstract class WalletRepository {
  Future<WalletSummaryEntity> getWalletSummary();
  
  Future<WalletTransactionsResponseEntity> getWalletTransactions({
    int page = 1,
    int limit = 10,
  });
  
  Future<WalletTransactionsResponseEntity> getTransactionsByType({
    required String type,
    int page = 1,
    int limit = 10,
  });
  
  Future<WalletRechargeResponseEntity> initiateWalletRecharge({
    required WalletRechargeEntity rechargeRequest,
  });
  
  Future<void> completeWalletRecharge({
    required int rechargeId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  });
  
  Future<void> cancelWalletRecharge({
    required int rechargeId,
  });
}