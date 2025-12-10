import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../../../../../../../commons/presenters/providers/dio_provider.dart';
import '../../../../../../../../commons/presenters/providers/error_handler_provider.dart';
import '../../data/datasources/wallet_datasource.dart';
import '../../data/repositories/wallet_repository_impl.dart';
import '../../domain/repositories/wallet_repository.dart';
import '../../domain/usecases/get_wallet_summary_usecase.dart';
import '../../domain/usecases/get_wallet_transactions_usecase.dart';
import '../../domain/usecases/initiate_wallet_recharge_usecase.dart';
import '../../domain/usecases/complete_wallet_recharge_usecase.dart';
import '../../domain/usecases/cancel_wallet_recharge_usecase.dart';
import '../viewmodels/wallet_notifier.dart';
import '../viewmodels/wallet_state.dart';

final walletDatasourceProvider = Provider<WalletDatasource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);

  return WalletDatasource(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

final walletRepositoryProvider = Provider<WalletRepository>((ref) {
  final datasource = ref.read(walletDatasourceProvider);

  return WalletRepositoryImpl(datasource: datasource);
});

final getWalletSummaryUseCaseProvider =
    Provider<GetWalletSummaryUseCase>((ref) {
  final repository = ref.read(walletRepositoryProvider);

  return GetWalletSummaryUseCase(repository: repository);
});

final getWalletTransactionsUseCaseProvider =
    Provider<GetWalletTransactionsUseCase>((ref) {
  final repository = ref.read(walletRepositoryProvider);

  return GetWalletTransactionsUseCase(repository: repository);
});

final initiateWalletRechargeUseCaseProvider =
    Provider<InitiateWalletRechargeUseCase>((ref) {
  final repository = ref.read(walletRepositoryProvider);

  return InitiateWalletRechargeUseCase(repository: repository);
});

final completeWalletRechargeUseCaseProvider =
    Provider<CompleteWalletRechargeUseCase>((ref) {
  final repository = ref.read(walletRepositoryProvider);

  return CompleteWalletRechargeUseCase(repository: repository);
});

final cancelWalletRechargeUseCaseProvider =
    Provider<CancelWalletRechargeUseCase>((ref) {
  final repository = ref.read(walletRepositoryProvider);

  return CancelWalletRechargeUseCase(repository: repository);
});

final razorpayProvider = Provider<Razorpay>((ref) {
  return Razorpay();
});

final walletNotifierProvider =
    StateNotifierProvider<WalletNotifier, WalletState>((ref) {
  final getWalletSummaryUseCase = ref.read(getWalletSummaryUseCaseProvider);
  final getWalletTransactionsUseCase =
      ref.read(getWalletTransactionsUseCaseProvider);
  final initiateWalletRechargeUseCase =
      ref.read(initiateWalletRechargeUseCaseProvider);
  final completeWalletRechargeUseCase =
      ref.read(completeWalletRechargeUseCaseProvider);
  final cancelWalletRechargeUseCase =
      ref.read(cancelWalletRechargeUseCaseProvider);
  final razorpay = ref.read(razorpayProvider);

  return WalletNotifier(
    getWalletSummaryUseCase: getWalletSummaryUseCase,
    getWalletTransactionsUseCase: getWalletTransactionsUseCase,
    initiateWalletRechargeUseCase: initiateWalletRechargeUseCase,
    completeWalletRechargeUseCase: completeWalletRechargeUseCase,
    cancelWalletRechargeUseCase: cancelWalletRechargeUseCase,
    razorpay: razorpay,
    ref: ref,
  );
});
