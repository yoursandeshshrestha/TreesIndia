import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'category_card_widget.dart';

class PopularCategoriesWidget extends StatelessWidget {
  final VoidCallback? onSeeAllTap;
  final VoidCallback? onCategoryTap;

  const PopularCategoriesWidget({
    super.key,
    this.onSeeAllTap,
    this.onCategoryTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with title and "See all" button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              H4Bold(
                text: 'Popular Categories',
                color: AppColors.brandNeutral900,
              ),
              GestureDetector(
                onTap: onSeeAllTap,
                child: const Text(
                  'See all',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF055c3a),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Horizontal scrollable list of category cards
          SizedBox(
            height: 160, // Height to accommodate image + title + spacing
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: EdgeInsets.zero,
              children: [
                CategoryCard(
                  image: 'assets/images/maid2.jpg',
                  title: 'Home Cleaning',
                  onTap: onCategoryTap,
                ),
                const SizedBox(width: AppSpacing.md),
                CategoryCard(
                  image: 'assets/images/maid3.jpg',
                  title: 'Plumbing Service',
                  onTap: onCategoryTap,
                ),
                const SizedBox(width: AppSpacing.md),
                CategoryCard(
                  image: 'assets/images/maid4.jpg',
                  title: 'Electrical Work',
                  onTap: onCategoryTap,
                ),
                const SizedBox(width: AppSpacing.md),
                CategoryCard(
                  image: 'assets/images/maid5.jpg',
                  title: 'Carpentry',
                  onTap: onCategoryTap,
                ),
                const SizedBox(width: AppSpacing.md),
                CategoryCard(
                  image: 'assets/images/electrician.jpg',
                  title: 'Construction',
                  onTap: onCategoryTap,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
