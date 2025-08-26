import 'package:flutter/material.dart';
import '../../../../../commons/components/skeleton/app/views/skeleton_widget.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';

class SubcategoryLoadingSkeleton extends StatelessWidget {
  const SubcategoryLoadingSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
        childAspectRatio: 0.9,
      ),
      itemCount: 6, // Show 9 skeleton cards
      itemBuilder: (context, index) => const _SubcategorySkeletonCard(),
    );
  }
}

class _SubcategorySkeletonCard extends StatelessWidget {
  const _SubcategorySkeletonCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brandNeutral200),
        boxShadow: [
          BoxShadow(
            color: AppColors.brandNeutral900.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon skeleton
          Expanded(
            flex: 1,
            child: Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(12),
                  topRight: Radius.circular(12),
                ),
              ),
              child: Center(
                child: SkeletonWidget(
                  width: 32,
                  height: 32,
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          // Title skeleton
          Expanded(
            flex: 1,
            child: Padding(
              padding: const EdgeInsets.symmetric(
                vertical: AppSpacing.md,
                horizontal: AppSpacing.sm,
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SkeletonWidget(
                      width: 60,
                      height: 12,
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
