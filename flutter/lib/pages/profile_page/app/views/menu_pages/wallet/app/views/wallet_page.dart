import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../../../../../../../../commons/constants/app_colors.dart';
import '../../../../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../../../../commons/components/app_bar/app/views/custom_app_bar.dart';
import '../providers/wallet_providers.dart';
import '../viewmodels/wallet_state.dart';
import 'widgets/wallet_balance_card.dart';
import 'widgets/transactions_list_widget.dart';
import 'widgets/recharge_bottom_sheet.dart';

class WalletPage extends ConsumerStatefulWidget {
  const WalletPage({super.key});

  @override
  ConsumerState<WalletPage> createState() => _WalletPageState();
}

class _WalletPageState extends ConsumerState<WalletPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(walletNotifierProvider.notifier).loadWalletData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final walletState = ref.watch(walletNotifierProvider);

    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: const CustomAppBar(
        title: 'My Wallet',
        backgroundColor: AppColors.white,
        iconColor: AppColors.brandNeutral800,
        titleColor: AppColors.brandNeutral800,
      ),
      body: _buildBody(walletState),
    );
  }

  Widget _buildBody(WalletState state) {
    if (state.walletSummary == null || state.status == WalletStatus.loading) {
      return const Center(
        child: CircularProgressIndicator(
          color: AppColors.brandPrimary600,
        ),
      );
    }

    if (state.status == WalletStatus.failure) {
      return _buildErrorState(state.errorMessage);
    }

    return Column(
      children: [
        // Wallet Balance Section
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          child: WalletBalanceCard(
            walletSummary: state.walletSummary!,
            onRecharge: _showRechargeBottomSheet,
          ),
        ),

        // Transactions List
        Expanded(
          child: TransactionsListWidget(
            transactions: state.transactions,
            isLoading: state.isLoadingMoreTransactions,
            hasMoreTransactions: state.hasMoreTransactions,
            onLoadMore: _loadMoreTransactions,
          ),
        ),
      ],
    );
  }

  Widget _buildErrorState(String errorMessage) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.stateRed500,
            ),
            const SizedBox(height: 16),
            H4Medium(
              text: 'Something went wrong',
              color: AppColors.brandNeutral800,
            ),
            const SizedBox(height: 8),
            B3Regular(
              text: errorMessage,
              color: AppColors.brandNeutral500,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _refreshWallet,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.brandPrimary600,
              ),
              child: B3Medium(
                text: 'Try Again',
                color: AppColors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _refreshWallet() {
    ref.read(walletNotifierProvider.notifier).refreshWalletData();
  }

  void _loadMoreTransactions() {
    ref.read(walletNotifierProvider.notifier).loadMoreTransactions();
  }

  void _showRechargeBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: RechargeBottomSheet(
          onRecharge: (amount) async {
            Navigator.of(context).pop();
            await ref
                .read(walletNotifierProvider.notifier)
                .initiateRecharge(amount);

            final rechargeState = ref.read(walletNotifierProvider);
            if (rechargeState.rechargeStatus == RechargeStatus.success) {
              _handleSuccessfulRecharge(rechargeState.rechargeResponse!);
            } else if (rechargeState.rechargeStatus == RechargeStatus.failure) {
              _showErrorMessage(rechargeState.errorMessage);
            }
          },
        ),
      ),
    );
  }

  void _handleSuccessfulRecharge(dynamic rechargeResponse) {
    // In a real app, this would integrate with Razorpay SDK
    // For now, just show a success message
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: B3Regular(
          text: 'Recharge initiated successfully',
          color: AppColors.white,
        ),
        backgroundColor: AppColors.stateGreen600,
      ),
    );

    // Reset recharge status
    ref.read(walletNotifierProvider.notifier).resetRechargeStatus();
  }

  void _showErrorMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: B3Regular(
          text: message,
          color: AppColors.white,
        ),
        backgroundColor: AppColors.stateRed600,
      ),
    );

    // Reset recharge status
    ref.read(walletNotifierProvider.notifier).resetRechargeStatus();
  }
}
