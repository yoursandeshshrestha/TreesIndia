import 'package:flutter/material.dart';
import '../../../../constants/app_colors.dart';
import '../../../../constants/app_spacing.dart';
import '../../../../components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/service_card/app/views/service_card_widget.dart';

class PopularServicesWidget extends StatelessWidget {
  final VoidCallback? onSeeAllTap;

  const PopularServicesWidget({
    super.key,
    this.onSeeAllTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Column(
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              H4Bold(
                text: 'Most booked services',
                color: AppColors.brandNeutral900,
              ),
              GestureDetector(
                onTap: onSeeAllTap,
                child: Text(
                  'See all',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF055c3a),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Service Cards
          SizedBox(
            height: 206, // Increased height to fix 6px overflow
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                ServiceCardWidget(
                  props: const ServiceCardProps(
                    image: 'assets/images/maid3.jpg',
                    title: 'Pest control (includes utensil re...)',
                    type: ServiceType.fixed,
                    duration: '2-3 hours',
                    price: '₹1,098',
                    rating: '4.79',
                    reviewCount: '116K',
                  ),
                  onTap: () {
                    // Handle tap
                  },
                ),
                const SizedBox(width: 12),
                ServiceCardWidget(
                  props: const ServiceCardProps(
                    image: 'assets/images/maid2.jpg',
                    title: 'Apartment pest control (includes ut...)',
                    type: ServiceType.inquiry,
                    duration: '1-2 hours',
                    price: '₹1,498',
                    rating: '4.80',
                    reviewCount: '52K',
                  ),
                  onTap: () {
                    // Handle tap
                  },
                ),
                const SizedBox(width: 12),
                ServiceCardWidget(
                  props: const ServiceCardProps(
                    image: 'assets/images/maid4.jpg',
                    title: 'Bed bug',
                    type: ServiceType.fixed,
                    duration: '1-3 hours',
                    price: '₹1,599',
                    rating: '4.77',
                    reviewCount: '2K',
                  ),
                  onTap: () {
                    // Handle tap
                  },
                ),
                const SizedBox(width: 12),
                ServiceCardWidget(
                  props: const ServiceCardProps(
                    image: 'assets/images/worker.png',
                    title: 'Carpentry',
                    type: ServiceType.inquiry,
                    duration: '2-4 hours',
                    price: '₹499',
                  ),
                  onTap: () {
                    // Handle tap
                  },
                ),
                const SizedBox(width: 12),
                ServiceCardWidget(
                  props: const ServiceCardProps(
                    image: 'assets/images/construction.png',
                    title: 'Construction',
                    type: ServiceType.fixed,
                    duration: '4-6 hours',
                    price: '₹899',
                  ),
                  onTap: () {
                    // Handle tap
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
