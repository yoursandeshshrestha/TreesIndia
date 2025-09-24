import 'package:flutter/material.dart';

import '../../../../constants/app_colors.dart';

enum ServiceType { fixed, inquiry }

class ServiceCardProps {
  final String image;
  final String title;
  final ServiceType type;
  final String duration;
  final String price;
  final String rating;
  final String reviewCount;

  const ServiceCardProps({
    required this.image,
    required this.title,
    this.type = ServiceType.fixed,
    this.duration = '2-3 hours',
    this.price = '₹299',
    this.rating = '4.79',
    this.reviewCount = '116K',
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
      child: SizedBox(
        width: 160,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Container
            Container(
              height: 100,
              decoration: const BoxDecoration(
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
                child: Image.asset(
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
              ),
            ),

            // Content
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    props.title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                      height: 1.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),

                  // Rating
                  Row(
                    children: [
                      const Icon(
                        Icons.star,
                        size: 16,
                        color: Colors.black,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${props.rating} (${props.reviewCount})',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Price
                  Text(
                    props.price,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.black,
                    ),
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
