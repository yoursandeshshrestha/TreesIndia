import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class EmptySubscriptionState extends StatelessWidget {
  const EmptySubscriptionState({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.brandNeutral50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.brandNeutral200,
              borderRadius: BorderRadius.circular(40),
            ),
            child: const Icon(
              Icons.subscriptions_outlined,
              size: 40,
              color: AppColors.brandNeutral500,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          const Text(
            'No Active Subscription',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.brandNeutral800,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'Subscribe to unlock premium features and get unlimited access to property listings.',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.brandNeutral600,
              height: 1.4,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}