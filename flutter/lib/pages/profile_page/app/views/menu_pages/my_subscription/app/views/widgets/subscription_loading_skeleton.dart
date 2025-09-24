import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class SubscriptionLoadingSkeleton extends StatelessWidget {
  const SubscriptionLoadingSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Active subscription card skeleton
          _buildSkeletonCard(height: 200),
          const SizedBox(height: AppSpacing.lg),

          // Button skeleton
          _buildSkeletonContainer(
            width: double.infinity,
            height: 48,
            borderRadius: 8,
          ),
          const SizedBox(height: AppSpacing.lg),

          // Billing history title skeleton
          _buildSkeletonContainer(
            width: 120,
            height: 20,
            borderRadius: 4,
          ),
          const SizedBox(height: AppSpacing.md),

          // Billing history items skeleton
          ...List.generate(
            3,
            (index) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.md),
              child: _buildSkeletonCard(height: 100),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSkeletonCard({required double height}) {
    return Container(
      width: double.infinity,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.brandNeutral100,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSkeletonContainer(
              width: 150,
              height: 16,
              borderRadius: 4,
            ),
            const SizedBox(height: AppSpacing.sm),
            _buildSkeletonContainer(
              width: double.infinity,
              height: 14,
              borderRadius: 4,
            ),
            const SizedBox(height: AppSpacing.xs),
            _buildSkeletonContainer(
              width: 200,
              height: 14,
              borderRadius: 4,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSkeletonContainer({
    required double width,
    required double height,
    required double borderRadius,
  }) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.brandNeutral200,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    );
  }
}