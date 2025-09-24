import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../../../domain/entities/subscription_entity.dart';

class BillingHistoryCard extends StatelessWidget {
  final SubscriptionEntity subscription;

  const BillingHistoryCard({
    super.key,
    required this.subscription,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Row(
        children: [
          // Date section
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  subscription.displayStartDateIST,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.brandNeutral900,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs / 2),
                Text(
                  subscription.plan?.name ?? 'Growth Plan',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.brandNeutral600,
                  ),
                ),
              ],
            ),
          ),

          // Amount section
          Expanded(
            flex: 1,
            child: Text(
              subscription.displayAmount,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.brandNeutral900,
              ),
              textAlign: TextAlign.right,
            ),
          ),

          const SizedBox(width: AppSpacing.sm),

          // Status section
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: AppSpacing.xs / 2,
            ),
            decoration: BoxDecoration(
              color: subscription.isActive
                  ? AppColors.stateGreen100
                  : AppColors.brandNeutral100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              subscription.displayStatus,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: subscription.isActive
                    ? AppColors.stateGreen700
                    : AppColors.brandNeutral600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}