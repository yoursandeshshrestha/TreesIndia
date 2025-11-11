import 'package:flutter/material.dart';
import '../../../../../commons/components/skeleton/app/views/skeleton_widget.dart';
import '../../../../../commons/constants/app_spacing.dart';

class CategoryLoadingSkeleton extends StatelessWidget {
  const CategoryLoadingSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(3, (index) {
        return Expanded(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
            child: const _CategorySkeletonCard(),
          ),
        );
      }),
    );
  }
}

class _CategorySkeletonCard extends StatelessWidget {
  const _CategorySkeletonCard();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Circular icon skeleton
        SkeletonWidget(
          width: 100,
          height: 60,
          borderRadius: BorderRadius.circular(8),
        ),
        const SizedBox(height: 12),
        // Title skeleton
        const SkeletonWidget(
          width: 80,
          height: 14,
        ),
        // const SizedBox(height: 8),
        // // Underline skeleton
        // const SkeletonWidget(
        //   width: 32,
        //   height: 2,
        // ),
      ],
    );
  }
}
