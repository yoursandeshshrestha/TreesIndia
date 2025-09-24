import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class VendorLoadingSkeleton extends StatefulWidget {
  const VendorLoadingSkeleton({super.key});

  @override
  State<VendorLoadingSkeleton> createState() => _VendorLoadingSkeletonState();
}

class _VendorLoadingSkeletonState extends State<VendorLoadingSkeleton>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _animation = Tween<double>(
      begin: 0.3,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    _animationController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return ListView.builder(
          padding: const EdgeInsets.all(AppSpacing.md),
          itemCount: 3,
          itemBuilder: (context, index) {
            return Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.md),
              child: _buildSkeletonCard(),
            );
          },
        );
      },
    );
  }

  Widget _buildSkeletonCard() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.brandNeutral200,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header skeleton
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSkeletonLine(
                      width: 150,
                      height: 16,
                    ),
                    const SizedBox(height: 4),
                    _buildSkeletonLine(
                      width: 100,
                      height: 14,
                    ),
                  ],
                ),
              ),
              _buildSkeletonBox(32, 32),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Description skeleton
          _buildSkeletonLine(
            width: double.infinity,
            height: 14,
          ),
          const SizedBox(height: 4),
          _buildSkeletonLine(
            width: 200,
            height: 14,
          ),

          const SizedBox(height: AppSpacing.md),

          // Contact info skeleton
          Row(
            children: [
              _buildSkeletonBox(16, 16),
              const SizedBox(width: 8),
              _buildSkeletonLine(
                width: 120,
                height: 12,
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              _buildSkeletonBox(16, 16),
              const SizedBox(width: 8),
              _buildSkeletonLine(
                width: 100,
                height: 12,
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Services skeleton
          Row(
            children: [
              _buildSkeletonChip(60),
              const SizedBox(width: 8),
              _buildSkeletonChip(80),
              const SizedBox(width: 8),
              _buildSkeletonChip(70),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          // Footer skeleton
          Row(
            children: [
              _buildSkeletonBox(16, 16),
              const SizedBox(width: 4),
              _buildSkeletonLine(
                width: 80,
                height: 12,
              ),
              const Spacer(),
              _buildSkeletonBox(16, 16),
              const SizedBox(width: 4),
              _buildSkeletonLine(
                width: 60,
                height: 12,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSkeletonLine({
    required double width,
    required double height,
  }) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.brandNeutral200.withValues(alpha: _animation.value),
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }

  Widget _buildSkeletonBox(double width, double height) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.brandNeutral200.withValues(alpha: _animation.value),
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }

  Widget _buildSkeletonChip(double width) {
    return Container(
      width: width,
      height: 24,
      decoration: BoxDecoration(
        color: AppColors.brandNeutral200.withValues(alpha: _animation.value),
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }
}