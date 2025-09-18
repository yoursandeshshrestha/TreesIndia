import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../../../domain/entities/subscription_entity.dart';

class ActiveSubscriptionCard extends StatelessWidget {
  final SubscriptionEntity subscription;

  const ActiveSubscriptionCard({
    super.key,
    required this.subscription,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.brandNeutral50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with icon and status
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.stateGreen600,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(
                  Icons.subscriptions,
                  color: AppColors.white,
                  size: 20,
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      subscription.plan?.name ?? 'Subscription Plan',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.brandNeutral900,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs / 2),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: AppSpacing.xs / 2,
                      ),
                      decoration: BoxDecoration(
                        color: subscription.isActive
                            ? AppColors.stateGreen100
                            : AppColors.brandNeutral200,
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
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Subscription details
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.brandNeutral200),
            ),
            child: Column(
              children: [
                _buildDetailRow(
                  'One-time payment',
                  subscription.displayAmount,
                  isAmount: true,
                ),
                const SizedBox(height: AppSpacing.sm),
                _buildDetailRow(
                  'Expires',
                  subscription.displayEndDateIST,
                ),
                const SizedBox(height: AppSpacing.sm),
                _buildDetailRow(
                  'Days remaining',
                  '${subscription.daysRemaining}',
                  highlight: subscription.daysRemaining <= 7,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(
    String label,
    String value, {
    bool isAmount = false,
    bool highlight = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: AppColors.brandNeutral600,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isAmount ? 16 : 14,
            fontWeight: isAmount ? FontWeight.w700 : FontWeight.w600,
            color: highlight
                ? AppColors.error
                : isAmount
                    ? AppColors.brandNeutral900
                    : AppColors.brandNeutral800,
          ),
        ),
      ],
    );
  }
}