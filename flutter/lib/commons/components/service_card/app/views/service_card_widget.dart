import 'package:flutter/material.dart';

import '../../../../constants/app_colors.dart';
import '../../../../constants/app_spacing.dart';
import '../../../text/app/views/custom_text_library.dart';

enum ServiceType { fixed, inquiry }

class ServiceCardProps {
  final String image;
  final String title;
  final ServiceType type;
  final String duration;
  final String price;
  final double? rating;
  final String? subcategory;

  const ServiceCardProps({
    required this.image,
    required this.title,
    this.type = ServiceType.fixed,
    this.duration = '2-3 hours',
    this.price = '₹299',
    this.rating,
    this.subcategory,
  });
}

class ServiceCardWidget extends StatelessWidget {
  final ServiceCardProps props;
  final VoidCallback? onTap;

  const ServiceCardWidget({
    super.key,
    required this.props,
    this.onTap,
  });

  bool _isNetworkImage() {
    return props.image.startsWith('http://') ||
        props.image.startsWith('https://');
  }

  Widget _buildImage() {
    final errorWidget = Container(
      width: double.infinity,
      height: double.infinity,
      color: AppColors.brandNeutral100,
      child: const Icon(
        Icons.image_outlined,
        size: 32,
        color: AppColors.brandNeutral400,
      ),
    );

    if (_isNetworkImage()) {
      return Image.network(
        props.image,
        width: double.infinity,
        height: double.infinity,
        fit: BoxFit.cover,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Container(
            width: double.infinity,
            height: double.infinity,
            color: AppColors.brandNeutral100,
            child: Center(
              child: CircularProgressIndicator(
                value: loadingProgress.expectedTotalBytes != null
                    ? loadingProgress.cumulativeBytesLoaded /
                        loadingProgress.expectedTotalBytes!
                    : null,
                strokeWidth: 2,
                color: AppColors.brandNeutral400,
              ),
            ),
          );
        },
        errorBuilder: (context, error, stackTrace) => errorWidget,
      );
    } else {
      return Image.asset(
        props.image,
        width: double.infinity,
        height: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => errorWidget,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: AppColors.brandNeutral200,
            width: 1,
          ),
          // boxShadow: [
          //   BoxShadow(
          //     color: AppColors.brandNeutral900.withValues(alpha: 0.08),
          //     blurRadius: 12,
          //     offset: const Offset(0, 4),
          //     spreadRadius: 0,
          //   ),
          // ],
        ),
        width: 240,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Service image with overlay gradient
            Stack(
              children: [
                Container(
                  height: 160,
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    color: AppColors.brandNeutral100,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(16),
                      topRight: Radius.circular(16),
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      topRight: Radius.circular(16),
                    ),
                    child: _buildImage(),
                  ),
                ),
                // Subtle gradient overlay at bottom
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 40,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.1),
                        ],
                      ),
                      // borderRadius: const BorderRadius.only(
                      //   bottomLeft: Radius.circular(16),
                      //   bottomRight: Radius.circular(16),
                      // ),
                    ),
                  ),
                ),
              ],
            ),

            // Service details
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.md,
                AppSpacing.md,
                AppSpacing.md,
                AppSpacing.md,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Service name
                  B3Bold(
                    text: props.title,
                    color: AppColors.brandNeutral900,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: AppSpacing.sm),

                  // Price and duration row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      // Price - more prominent
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              props.price,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: AppColors.stateGreen600,
                                height: 1.2,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      // Duration badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.sm,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.brandNeutral50,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.access_time_rounded,
                              size: 14,
                              color: AppColors.brandNeutral600,
                            ),
                            const SizedBox(width: 4),
                            B4Regular(
                              text: props.duration,
                              color: AppColors.brandNeutral700,
                              maxLines: 1,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
