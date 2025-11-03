import 'package:flutter/material.dart';
import '../../../../../commons/components/skeleton/app/views/skeleton_widget.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../../../commons/constants/app_colors.dart';

class PropertyCardSkeleton extends StatelessWidget {
  final String version;

  const PropertyCardSkeleton({
    super.key,
    this.version = 'property-listing',
  });

  @override
  Widget build(BuildContext context) {
    final imageHeight = version == 'home' ? 140.0 : 200.0;

    return Container(
      width: 320,
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image skeleton
          SkeletonWidget(
            width: double.infinity,
            height: imageHeight,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
          ),

          // Content skeleton
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title skeleton
                SkeletonWidget(
                  width: 200,
                  height: 18,
                  borderRadius: BorderRadius.circular(4),
                ),
                const SizedBox(height: AppSpacing.xs),

                // Address skeleton
                Row(
                  children: [
                    SkeletonWidget(
                      width: 16,
                      height: 16,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    SkeletonWidget(
                      width: 150,
                      height: 12,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),

                // Property info row skeleton (chips)
                Row(
                  children: [
                    SkeletonWidget(
                      width: 80,
                      height: 28,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    SkeletonWidget(
                      width: 60,
                      height: 28,
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),

                // Price skeleton
                SkeletonWidget(
                  width: 120,
                  height: 20,
                  borderRadius: BorderRadius.circular(4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
