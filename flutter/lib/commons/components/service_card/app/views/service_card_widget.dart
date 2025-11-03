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
      color: AppColors.brandNeutral200,
      child: const Icon(
        Icons.image,
        size: 40,
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
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.brandNeutral200,
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        width: 160,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Service image
            Container(
              height: 100,
              width: double.infinity,
              decoration: const BoxDecoration(
                color: AppColors.brandNeutral100,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(12),
                  topRight: Radius.circular(12),
                ),
              ),
              child: ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  topRight: Radius.circular(12),
                ),
                child: _buildImage(),
              ),
            ),

            // Service details
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.sm),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Service name and rating
                    Row(
                      children: [
                        Expanded(
                          child: B3Bold(
                            text: props.title,
                            color: AppColors.brandNeutral900,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (props.rating != null) ...[
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.star,
                            size: 14,
                            color: Colors.amber,
                          ),
                          const SizedBox(width: 2),
                          B4Regular(
                            text: props.rating!.toStringAsFixed(1),
                            color: AppColors.brandNeutral700,
                          ),
                        ],
                      ],
                    ),

                    const SizedBox(height: AppSpacing.xs),

                    // Category badge
                    if (props.subcategory != null)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.xs,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF055c3a).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: B4Regular(
                          text: props.subcategory!,
                          color: const Color(0xFF055c3a),
                        ),
                      ),

                    const Spacer(),

                    // Price and duration
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: B4Bold(
                            text: props.price,
                            color: const Color(0xFF055c3a),
                          ),
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.access_time,
                              size: 12,
                              color: AppColors.brandNeutral500,
                            ),
                            const SizedBox(width: 2),
                            B4Regular(
                              text: props.duration,
                              color: AppColors.brandNeutral600,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
