import 'package:flutter/material.dart';
import '../../../../../commons/components/skeleton/app/views/skeleton_widget.dart';
import '../../../../../commons/constants/app_spacing.dart';

class BannerSkeletonWidget extends StatelessWidget {
  const BannerSkeletonWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 160,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        itemCount: 2,
        itemBuilder: (context, index) {
          return Padding(
            padding: EdgeInsets.only(
              right: index < 1 ? AppSpacing.md : 0,
            ),
            child: SkeletonWidget(
              width: 320,
              height: 160,
              borderRadius: BorderRadius.circular(12),
            ),
          );
        },
      ),
    );
  }
}
