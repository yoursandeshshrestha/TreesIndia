import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class NotificationLoadingWidget extends StatelessWidget {
  const NotificationLoadingWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      itemCount: 8, // Show 8 skeleton items
      itemBuilder: (context, index) {
        return _buildSkeletonItem();
      },
    );
  }

  Widget _buildSkeletonItem() {
    return LayoutBuilder(
      builder: (context, constraints) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: AppColors.brandNeutral100,
            width: 1,
          ),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Skeleton icon
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.brandNeutral200,
              borderRadius: BorderRadius.circular(20),
            ),
          ),

          const SizedBox(width: AppSpacing.md),

          // Skeleton content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title skeleton
                Container(
                  width: double.infinity,
                  height: 16,
                  decoration: BoxDecoration(
                    color: AppColors.brandNeutral200,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),

                const SizedBox(height: AppSpacing.xs),

                // Message skeleton - first line
                Container(
                  width: double.infinity,
                  height: 12,
                  decoration: BoxDecoration(
                    color: AppColors.brandNeutral100,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),

                const SizedBox(height: AppSpacing.xs),

                // Message skeleton - second line (shorter)
                Container(
                  width: constraints.maxWidth * 0.6,
                  height: 12,
                  decoration: BoxDecoration(
                    color: AppColors.brandNeutral100,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(width: AppSpacing.sm),

          // Time skeleton
          Container(
            width: 40,
            height: 12,
            decoration: BoxDecoration(
              color: AppColors.brandNeutral100,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ],
      ),
    );
      },
    );
  }
}