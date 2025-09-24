import 'package:flutter/material.dart';
import '../../../../../../../../../commons/constants/app_colors.dart';
import '../../../../../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/wallet_summary_entity.dart';

class WalletBalanceCard extends StatelessWidget {
  final WalletSummaryEntity walletSummary;
  final VoidCallback onRecharge;

  const WalletBalanceCard({
    super.key,
    required this.walletSummary,
    required this.onRecharge,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Balance Content
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Treesindia Cash Label
              const Text(
                'Treesindia Cash',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.brandNeutral800,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),

              // Balance Amount
              Text(
                '₹${walletSummary.currentBalance.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.brandNeutral900,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),

              // Explanatory Text
              const Text(
                'Applicable on all services',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.brandNeutral500,
                  height: 1.3,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.lg),

          // Recharge Button - Same style as address button
          GestureDetector(
            onTap: onRecharge,
            child: const Row(
              children: [
                Icon(
                  Icons.add,
                  color: Color(0xFF055c3a),
                  size: 20,
                ),
                SizedBox(width: AppSpacing.md),
                Text(
                  'Recharge Wallet',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF055c3a),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
