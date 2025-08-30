import 'package:flutter/material.dart';
import '../../../../constants/app_colors.dart';
import '../../../../constants/app_spacing.dart';
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
              Text(
                'Popular Services',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppColors.brandNeutral800,
                ),
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
            height: 200, // Height for the cards
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                ServiceCardWidget(
                  props: const ServiceCardProps(
                    image: 'assets/images/cleaner.png',
                    title: 'Home Cleaning',
                    type: ServiceType.fixed,
                    duration: '2-3 hours',
                    price: '₹299',
                  ),
                  onTap: () {
                    // Handle tap
                  },
                ),
                const SizedBox(width: 12),
                ServiceCardWidget(
                  props: const ServiceCardProps(
                    image: 'assets/images/construction.png',
                    title: 'Plumbing Service',
                    type: ServiceType.inquiry,
                    duration: '1-2 hours',
                    price: '₹199',
                  ),
                  onTap: () {
                    // Handle tap
                  },
                ),
                const SizedBox(width: 12),
                ServiceCardWidget(
                  props: const ServiceCardProps(
                    image: 'assets/images/electrician.jpg',
                    title: 'Electrical Work',
                    type: ServiceType.fixed,
                    duration: '1-3 hours',
                    price: '₹399',
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
