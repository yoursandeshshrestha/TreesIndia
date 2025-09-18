import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../../../domain/entities/subscription_entity.dart';

class SubscriptionPlanCard extends StatelessWidget {
  final SubscriptionPlanEntity plan;
  final bool isSelected;
  final String? selectedDurationType;
  final Function(int planId, String durationType) onPlanSelected;

  const SubscriptionPlanCard({
    super.key,
    required this.plan,
    required this.isSelected,
    this.selectedDurationType,
    required this.onPlanSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSelected ? AppColors.stateGreen600 : AppColors.brandNeutral200,
          width: isSelected ? 2 : 1,
        ),
        boxShadow: isSelected
            ? [
                BoxShadow(
                  color: AppColors.stateGreen600.withValues(alpha: 0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.stateGreen600,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  plan.name,
                  style: const TextStyle(
                    color: AppColors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  plan.description,
                  style: const TextStyle(
                    color: AppColors.white,
                    fontSize: 14,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Pricing options
                Row(
                  children: [
                    // Monthly option
                    if (plan.getMonthlyPrice() != null)
                      Expanded(
                        child: _buildPricingOption(
                          durationType: 'monthly',
                          price: plan.getMonthlyPrice()!,
                          period: 'month',
                          isSelected: isSelected && selectedDurationType == 'monthly',
                        ),
                      ),

                    if (plan.getMonthlyPrice() != null && plan.getYearlyPrice() != null)
                      const SizedBox(width: AppSpacing.md),

                    // Yearly option
                    if (plan.getYearlyPrice() != null)
                      Expanded(
                        child: _buildPricingOption(
                          durationType: 'yearly',
                          price: plan.getYearlyPrice()!,
                          period: 'year',
                          isSelected: isSelected && selectedDurationType == 'yearly',
                          badge: 'Most popular',
                        ),
                      ),
                  ],
                ),

                const SizedBox(height: AppSpacing.lg),

                // Features
                const Text(
                  "What's included:",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.brandNeutral900,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),

                ...plan.featuresList.map(
                  (feature) => Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.check,
                          color: AppColors.stateGreen600,
                          size: 20,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Text(
                            feature.trim(),
                            style: const TextStyle(
                              fontSize: 14,
                              color: AppColors.brandNeutral700,
                              height: 1.3,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPricingOption({
    required String durationType,
    required double price,
    required String period,
    required bool isSelected,
    String? badge,
  }) {
    return GestureDetector(
      onTap: () => onPlanSelected(plan.id, durationType),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.stateGreen50 : AppColors.brandNeutral50,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppColors.stateGreen600 : AppColors.brandNeutral200,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            // Badge
            if (badge != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.xs / 2,
                ),
                decoration: BoxDecoration(
                  color: AppColors.brandPrimary600,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  badge,
                  style: const TextStyle(
                    color: AppColors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
            ],

            // Price
            Text(
              '₹${price.toStringAsFixed(0)}',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: isSelected ? AppColors.stateGreen700 : AppColors.brandNeutral900,
              ),
            ),
            const SizedBox(height: AppSpacing.xs / 2),
            Text(
              '/ $period',
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.brandNeutral600,
              ),
            ),

            const SizedBox(height: AppSpacing.sm),

            // Button
            Container(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => onPlanSelected(plan.id, durationType),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isSelected
                      ? AppColors.stateGreen600
                      : AppColors.white,
                  foregroundColor: isSelected
                      ? AppColors.white
                      : AppColors.stateGreen600,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(
                    vertical: AppSpacing.sm,
                  ),
                  side: BorderSide(
                    color: AppColors.stateGreen600,
                    width: 1,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                child: Text(
                  isSelected ? 'Selected' : 'Select Plan',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}