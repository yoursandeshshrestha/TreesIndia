import 'package:flutter/material.dart';
import '../../../../constants/app_colors.dart';
import '../../../../constants/app_spacing.dart';

enum ServiceType { fixed, inquiry }

class ServiceCardProps {
  final String image;
  final String title;
  final ServiceType type;
  final String duration;
  final String price;

  const ServiceCardProps({
    required this.image,
    required this.title,
    this.type = ServiceType.fixed,
    this.duration = '2-3 hours',
    this.price = '₹299',
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

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 180,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Container
            Container(
              height: 128, // h-32 = 128px
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8), // rounded-lg
                boxShadow: [
                  BoxShadow(
                    color: AppColors.brandNeutral900.withValues(alpha: 0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Stack(
                  children: [
                    // Image
                    Image.asset(
                      props.image,
                      width: double.infinity,
                      height: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          width: double.infinity,
                          height: double.infinity,
                          color: AppColors.brandNeutral200,
                          child: const Icon(
                            Icons.image,
                            size: 40,
                            color: AppColors.brandNeutral400,
                          ),
                        );
                      },
                    ),
                    // Gradient Overlay
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.5),
                          ],
                        ),
                      ),
                    ),
                    // Type Badge
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: props.type == ServiceType.fixed
                              ? AppColors.stateGreen50
                              : AppColors.stateYellow50,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          props.type == ServiceType.fixed ? 'Fixed' : 'Inquiry',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: props.type == ServiceType.fixed
                                ? AppColors.stateGreen700
                                : AppColors.stateYellow700,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12), // mb-3 = 12px

            // Content
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4), // px-1 = 4px
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    props.title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppColors.brandNeutral800,
                    ),
                  ),
                  const SizedBox(height: 8), // mb-2 = 8px

                  // Duration and Price (only for fixed services)
                  if (props.type == ServiceType.fixed)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          props.duration,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w400,
                            color: AppColors.brandNeutral500,
                          ),
                        ),
                        Text(
                          props.price,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: AppColors.stateGreen600,
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
