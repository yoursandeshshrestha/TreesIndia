import 'package:equatable/equatable.dart';
import '../../domain/entities/wallet_summary_entity.dart';
import '../../domain/entities/wallet_transaction_entity.dart';
import '../../domain/entities/wallet_recharge_entity.dart';

enum WalletStatus { initial, loading, success, failure }
enum RechargeStatus { initial, processing, success, failure }

class WalletState extends Equatable {
  final WalletStatus status;
  final WalletSummaryEntity? walletSummary;
  final List<WalletTransactionEntity> transactions;
  final bool isLoadingMoreTransactions;
  final bool hasMoreTransactions;
  final int currentPage;
  final RechargeStatus rechargeStatus;
  final WalletRechargeResponseEntity? rechargeResponse;
  final bool isRefreshing;
  final String errorMessage;

  const WalletState({
    this.status = WalletStatus.initial,
    this.walletSummary,
    this.transactions = const [],
    this.isLoadingMoreTransactions = false,
    this.hasMoreTransactions = true,
    this.currentPage = 1,
    this.rechargeStatus = RechargeStatus.initial,
    this.rechargeResponse,
    this.isRefreshing = false,
    this.errorMessage = '',
  });

  WalletState copyWith({
    WalletStatus? status,
    WalletSummaryEntity? walletSummary,
    List<WalletTransactionEntity>? transactions,
    bool? isLoadingMoreTransactions,
    bool? hasMoreTransactions,
    int? currentPage,
    RechargeStatus? rechargeStatus,
    WalletRechargeResponseEntity? rechargeResponse,
    bool? isRefreshing,
    String? errorMessage,
  }) {
    return WalletState(
      status: status ?? this.status,
      walletSummary: walletSummary ?? this.walletSummary,
      transactions: transactions ?? this.transactions,
      isLoadingMoreTransactions: isLoadingMoreTransactions ?? this.isLoadingMoreTransactions,
      hasMoreTransactions: hasMoreTransactions ?? this.hasMoreTransactions,
      currentPage: currentPage ?? this.currentPage,
      rechargeStatus: rechargeStatus ?? this.rechargeStatus,
      rechargeResponse: rechargeResponse ?? this.rechargeResponse,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status,
        walletSummary,
        transactions,
        isLoadingMoreTransactions,
        hasMoreTransactions,
        currentPage,
        rechargeStatus,
        rechargeResponse,
        isRefreshing,
        errorMessage,
      ];
}