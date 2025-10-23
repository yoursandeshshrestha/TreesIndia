import 'package:flutter/material.dart';
import '../../../../../commons/components/skeleton/app/views/skeleton_widget.dart';
import '../../../../../commons/constants/app_spacing.dart';

class BannerSkeletonWidget extends StatelessWidget {
  const BannerSkeletonWidget({super.key});

  @override
  Widget build(BuildContext context) {
    // Calculate dynamic dimensions based on screen width
    final screenWidth = MediaQuery.of(context).size.width;
    final bannerWidth = screenWidth * 0.8;
    final bannerHeight = bannerWidth / 3; // Maintain 2:1 aspect ratio

    return SizedBox(
      height: bannerHeight,
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
              width: bannerWidth,
              height: bannerHeight,
              borderRadius: BorderRadius.circular(12),
            ),
          );
        },
      ),
    );
  }
}
