import '../../domain/entities/wallet_summary_entity.dart';
import '../../domain/entities/wallet_transactions_response_entity.dart';
import '../../domain/entities/wallet_recharge_entity.dart';
import '../../domain/repositories/wallet_repository.dart';
import '../datasources/wallet_datasource.dart';
import '../models/wallet_recharge_model.dart';

class WalletRepositoryImpl implements WalletRepository {
  final WalletDatasource datasource;

  WalletRepositoryImpl({required this.datasource});

  @override
  Future<WalletSummaryEntity> getWalletSummary() async {
    final model = await datasource.getWalletSummary();
    return model.toEntity();
  }

  @override
  Future<WalletTransactionsResponseEntity> getWalletTransactions({
    int page = 1,
    int limit = 10,
  }) async {
    final model = await datasource.getWalletTransactions(
      page: page,
      limit: limit,
    );
    return model.toEntity();
  }

  @override
  Future<WalletTransactionsResponseEntity> getTransactionsByType({
    required String type,
    int page = 1,
    int limit = 10,
  }) async {
    final model = await datasource.getTransactionsByType(
      type: type,
      page: page,
      limit: limit,
    );
    return model.toEntity();
  }

  @override
  Future<WalletRechargeResponseEntity> initiateWalletRecharge({
    required WalletRechargeEntity rechargeRequest,
  }) async {
    final requestModel = WalletRechargeModel.fromEntity(rechargeRequest);
    final responseModel = await datasource.initiateWalletRecharge(
      rechargeRequest: requestModel,
    );
    return responseModel.toEntity();
  }

  @override
  Future<void> completeWalletRecharge({
    required int rechargeId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    await datasource.completeWalletRecharge(
      rechargeId: rechargeId,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature,
    );
  }

  @override
  Future<void> cancelWalletRecharge({
    required int rechargeId,
  }) async {
    await datasource.cancelWalletRecharge(rechargeId: rechargeId);
  }
}