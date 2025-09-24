import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

import '../../../../../../../../../commons/constants/app_colors.dart';
import '../../../domain/entities/wallet_transaction_entity.dart';
import 'transaction_item_widget.dart';

class TransactionsListWidget extends StatelessWidget {
  final List<WalletTransactionEntity> transactions;
  final bool isLoading;
  final bool hasMoreTransactions;
  final VoidCallback onLoadMore;
  final Function(WalletTransactionEntity)? onCompletePayment;

  const TransactionsListWidget({
    super.key,
    required this.transactions,
    required this.isLoading,
    required this.hasMoreTransactions,
    required this.onLoadMore,
    this.onCompletePayment,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Top separator - big border like home page banner
        Container(
          height: 8,
          color: const Color(0xFFF5F5F5),
        ),

        // Transactions Header
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          child: const Text(
            'Recent Transactions',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.brandNeutral800,
            ),
          ),
        ),

        // Transactions List
        Expanded(
          child: _buildTransactionsList(),
        ),
      ],
    );
  }

  Widget _buildTransactionsList() {
    if (transactions.isEmpty && !isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.history_outlined,
              size: 64,
              color: AppColors.brandNeutral400,
            ),
            SizedBox(height: AppSpacing.md),
            Text(
              'No Transactions Yet',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.brandNeutral600,
              ),
            ),
            SizedBox(height: AppSpacing.sm),
            Text(
              'Your transaction history will appear here',
              style: TextStyle(
                color: AppColors.brandNeutral500,
              ),
            ),
          ],
        ),
      );
    }

    return NotificationListener<ScrollNotification>(
      onNotification: (ScrollNotification scrollInfo) {
        if (!isLoading &&
            hasMoreTransactions &&
            scrollInfo.metrics.pixels == scrollInfo.metrics.maxScrollExtent) {
          onLoadMore();
        }
        return false;
      },
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        itemCount: transactions.length + (hasMoreTransactions ? 1 : 0),
        separatorBuilder: (context, index) => const Divider(
          color: AppColors.brandNeutral100,
          height: 1,
        ),
        itemBuilder: (context, index) {
          if (index == transactions.length) {
            // Load more indicator
            if (isLoading) {
              return Container(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
                child: const Center(
                  child: CircularProgressIndicator(
                    color: AppColors.brandPrimary600,
                  ),
                ),
              );
            }
            return const SizedBox.shrink();
          }

          final transaction = transactions[index];
          return TransactionItemWidget(
            transaction: transaction,
            onCompletePayment: onCompletePayment != null
                ? () => onCompletePayment!(transaction)
                : null,
          );
        },
      ),
    );
  }
}
