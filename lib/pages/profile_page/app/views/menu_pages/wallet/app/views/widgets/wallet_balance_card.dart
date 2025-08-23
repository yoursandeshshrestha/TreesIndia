import 'package:flutter/material.dart';
import '../../../../../../../../../commons/constants/app_colors.dart';
import '../../../../../../../../../commons/components/text/app/views/custom_text_library.dart';
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
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20.0),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.brandPrimary600,
            AppColors.brandPrimary700,
          ],
        ),
        borderRadius: BorderRadius.circular(16.0),
        boxShadow: [
          BoxShadow(
            color: AppColors.brandPrimary600.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  B2Regular(
                    text: 'Available Balance',
                    color: AppColors.brandPrimary100,
                  ),
                  const SizedBox(height: 8),
                  H2Bold(
                    text: '₹${walletSummary.currentBalance.toStringAsFixed(2)}',
                    color: AppColors.white,
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.brandPrimary500.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.account_balance_wallet,
                  color: AppColors.white,
                  size: 24,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton.icon(
              onPressed: onRecharge,
              icon: const Icon(
                Icons.add,
                color: AppColors.brandPrimary600,
                size: 20,
              ),
              label: B2Regular(
                text: 'Recharge Wallet',
                color: AppColors.brandPrimary600,
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}