import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../../../../../../../../../commons/constants/app_colors.dart';
import '../../../../../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../domain/entities/wallet_transaction_entity.dart';
import 'transaction_item_widget.dart';

class TransactionsListWidget extends StatelessWidget {
  final List<WalletTransactionEntity> transactions;
  final bool isLoading;
  final bool hasMoreTransactions;
  final VoidCallback onLoadMore;

  const TransactionsListWidget({
    super.key,
    required this.transactions,
    required this.isLoading,
    required this.hasMoreTransactions,
    required this.onLoadMore,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.lg),
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: const BoxDecoration(
        color: AppColors.brandNeutral50,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                H3Bold(
                  text: 'Recent Transactions',
                  color: AppColors.brandNeutral800,
                ),
                // if (transactions.isNotEmpty)
                //   InkWell(
                //     onTap: () {
                //       // Navigate to full transactions page
                //     },
                //     child: B3Medium(
                //       text: 'View All',
                //       color: AppColors.brandPrimary600,
                //     ),
                //   ),
              ],
            ),
          ),
          Expanded(
            child: _buildTransactionsList(),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionsList() {
    if (transactions.isEmpty && !isLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.history_outlined,
              size: 64,
              color: AppColors.brandNeutral400,
            ),
            const SizedBox(height: 16),
            H4Medium(
              text: 'No Transactions Yet',
              color: AppColors.brandNeutral600,
            ),
            const SizedBox(height: 8),
            B3Regular(
              text: 'Your transaction history will appear here',
              color: AppColors.brandNeutral500,
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
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: transactions.length + (hasMoreTransactions ? 1 : 0),
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          if (index == transactions.length) {
            return _buildLoadingIndicator();
          }

          return TransactionItemWidget(
            transaction: transactions[index],
          );
        },
      ),
    );
  }

  Widget _buildLoadingIndicator() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: const Center(
        child: SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: AppColors.brandPrimary600,
          ),
        ),
      ),
    );
  }
}
