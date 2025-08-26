import 'package:flutter/material.dart';
import '../../../../../commons/components/skeleton/app/views/skeleton_widget.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';

class CategoryLoadingSkeleton extends StatelessWidget {
  const CategoryLoadingSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 0),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: List.generate(3, (index) {
            return Container(
              margin: EdgeInsets.only(
                left: index == 0 ? AppSpacing.lg : 0,
                right: index < 2 ? AppSpacing.md : AppSpacing.lg,
              ),
              child: const _CategorySkeletonCard(),
            );
          }),
        ),
      ),
    );
  }
}

class _CategorySkeletonCard extends StatelessWidget {
  const _CategorySkeletonCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 136,
      width: 120,
      padding: const EdgeInsets.only(
        top: 20.0,
        bottom: AppSpacing.md,
        left: AppSpacing.sm,
        right: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.brandNeutral200,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.brandNeutral900.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          // Icon skeleton
          SkeletonWidget(
            width: 48,
            height: 48,
            borderRadius: BorderRadius.circular(12),
          ),
          const SizedBox(height: 12.0),
          // Title skeleton
          const SkeletonWidget(
            width: 80,
            height: 12,
          ),
          const SizedBox(height: 4),
          // Subtitle skeleton
          const SkeletonWidget(
            width: 60,
            height: 10,
          ),
        ],
      ),
    );
  }
}