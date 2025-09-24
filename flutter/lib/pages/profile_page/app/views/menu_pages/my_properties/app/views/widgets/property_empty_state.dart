import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class PropertyEmptyState extends StatelessWidget {
  const PropertyEmptyState({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.home_outlined,
              size: 64,
              color: AppColors.brandNeutral300,
            ),
            SizedBox(height: AppSpacing.md),
            Text(
              'No Properties Yet',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.brandNeutral800,
              ),
            ),
            SizedBox(height: AppSpacing.sm),
            Text(
              'Click the + button to add your first property',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.brandNeutral600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}