import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../../../../../../../commons/environment/global_environment.dart';
import '../../domain/entities/wallet_recharge_entity.dart';
import '../../domain/usecases/get_wallet_summary_usecase.dart';
import '../../domain/usecases/get_wallet_transactions_usecase.dart';
import '../../domain/usecases/initiate_wallet_recharge_usecase.dart';
import '../../domain/usecases/complete_wallet_recharge_usecase.dart';
import '../../domain/usecases/cancel_wallet_recharge_usecase.dart';
import 'wallet_state.dart';

class WalletNotifier extends StateNotifier<WalletState> {
  final GetWalletSummaryUseCase getWalletSummaryUseCase;
  final GetWalletTransactionsUseCase getWalletTransactionsUseCase;
  final InitiateWalletRechargeUseCase initiateWalletRechargeUseCase;
  final CompleteWalletRechargeUseCase completeWalletRechargeUseCase;
  final CancelWalletRechargeUseCase cancelWalletRechargeUseCase;
  final Razorpay razorpay;

  WalletNotifier({
    required this.getWalletSummaryUseCase,
    required this.getWalletTransactionsUseCase,
    required this.initiateWalletRechargeUseCase,
    required this.completeWalletRechargeUseCase,
    required this.cancelWalletRechargeUseCase,
    required this.razorpay,
  }) : super(const WalletState()) {
    razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  Future<void> loadWalletData() async {
    state = state.copyWith(status: WalletStatus.loading);

    try {
      await Future.wait([
        _loadWalletSummary(),
        _loadTransactions(refresh: true),
      ]);

      state = state.copyWith(status: WalletStatus.success);
    } catch (error) {
      state = state.copyWith(
        status: WalletStatus.failure,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> _loadWalletSummary() async {
    try {
      final summary = await getWalletSummaryUseCase();
      state = state.copyWith(walletSummary: summary);
    } catch (error) {
      throw Exception('Failed to load wallet summary: $error');
    }
  }

  Future<void> _loadTransactions({bool refresh = false}) async {
    try {
      final page = refresh ? 1 : state.currentPage;
      final response = await getWalletTransactionsUseCase(
        page: page,
        limit: 10,
      );

      if (refresh) {
        state = state.copyWith(
          transactions: response.transactions,
          currentPage: 1,
          hasMoreTransactions: response.pagination.totalPages > 1,
        );
      } else {
        final allTransactions = [
          ...state.transactions,
          ...response.transactions
        ];
        state = state.copyWith(
          transactions: allTransactions,
          currentPage: page,
          hasMoreTransactions: page < response.pagination.totalPages,
        );
      }
    } catch (error) {
      throw Exception('Failed to load transactions: $error');
    }
  }

  Future<void> loadMoreTransactions() async {
    if (state.isLoadingMoreTransactions || !state.hasMoreTransactions) {
      return;
    }

    state = state.copyWith(isLoadingMoreTransactions: true);

    try {
      state = state.copyWith(
        isLoadingMoreTransactions: false,
        currentPage: state.currentPage + 1,
      );
      await _loadTransactions();
    } catch (error) {
      state = state.copyWith(
        isLoadingMoreTransactions: false,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> initiateRecharge(double amount) async {
    state = state.copyWith(rechargeStatus: RechargeStatus.processing);

    try {
      final rechargeRequest = WalletRechargeEntity(
        amount: amount,
        paymentMethod: 'razorpay',
      );

      final response = await initiateWalletRechargeUseCase(
        rechargeRequest: rechargeRequest,
      );

      state = state.copyWith(
        rechargeResponse: response,
      );

      _openRazorpayCheckout(response);
    } catch (error) {
      state = state.copyWith(
        rechargeStatus: RechargeStatus.failure,
        errorMessage: error.toString(),
      );
    }
  }

  void resetRechargeStatus() {
    state = state.copyWith(
      rechargeStatus: RechargeStatus.initial,
      rechargeResponse: null,
    );
  }

  Future<void> refreshWalletData() async {
    state = state.copyWith(isRefreshing: true);

    try {
      await Future.wait([
        _loadWalletSummary(),
        _loadTransactions(refresh: true),
      ]);

      state = state.copyWith(
        status: WalletStatus.success,
        isRefreshing: false,
      );
    } catch (error) {
      state = state.copyWith(
        status: WalletStatus.failure,
        errorMessage: error.toString(),
        isRefreshing: false,
      );
    }
  }

  void _openRazorpayCheckout(WalletRechargeResponseEntity rechargeResponse) {
    final options = {
      'key': GlobalEnvironment.razorpayKey,
      'amount': rechargeResponse.paymentOrder.amount,
      'currency': rechargeResponse.paymentOrder.currency,
      'order_id': rechargeResponse.paymentOrder.id,
      'receipt': rechargeResponse.paymentOrder.receipt,
      'name': 'Trees India',
      'description': 'Wallet Recharge',
      'prefill': {'contact': '', 'email': ''}
    };

    try {
      razorpay.open(options);
    } catch (error) {
      state = state.copyWith(
        rechargeStatus: RechargeStatus.failure,
        errorMessage: 'Failed to open payment gateway: $error',
      );
    }
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    _completeWalletRecharge(
      razorpayOrderId: response.orderId ?? '',
      razorpayPaymentId: response.paymentId ?? '',
      razorpaySignature: response.signature ?? '',
    );
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    _cancelWalletRecharge();
    state = state.copyWith(
      rechargeStatus: RechargeStatus.failure,
      errorMessage: response.message ?? 'Payment failed',
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    state = state.copyWith(
      rechargeStatus: RechargeStatus.failure,
      errorMessage: 'External wallet selected: ${response.walletName}',
    );
  }

  Future<void> _completeWalletRecharge({
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    try {
      final rechargeResponse = state.rechargeResponse;
      if (rechargeResponse == null) {
        throw Exception('No recharge response found');
      }

      await completeWalletRechargeUseCase(
        rechargeId: rechargeResponse.payment.id,
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: razorpaySignature,
      );

      state = state.copyWith(
        rechargeStatus: RechargeStatus.success,
      );

      await refreshWalletData();
    } catch (error) {
      state = state.copyWith(
        rechargeStatus: RechargeStatus.failure,
        errorMessage: 'Failed to complete payment: $error',
      );
    }
  }

  Future<void> _cancelWalletRecharge() async {
    try {
      final rechargeResponse = state.rechargeResponse;
      if (rechargeResponse != null) {
        await cancelWalletRechargeUseCase(
          rechargeId: rechargeResponse.payment.id,
        );
      }

      await refreshWalletData();
    } catch (error) {
      print('Error cancelling wallet recharge: $error');
    }
  }

  @override
  void dispose() {
    razorpay.clear();
    super.dispose();
  }
}
