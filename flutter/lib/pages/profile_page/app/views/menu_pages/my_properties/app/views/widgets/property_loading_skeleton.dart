import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class PropertyLoadingSkeleton extends StatelessWidget {
  const PropertyLoadingSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: 3,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: _SkeletonCard(),
        );
      },
    );
  }
}

class _SkeletonCard extends StatefulWidget {
  @override
  _SkeletonCardState createState() => _SkeletonCardState();
}

class _SkeletonCardState extends State<_SkeletonCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _animation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(_animationController);
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
        return Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.brandNeutral200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: _SkeletonBox(
                      height: 20,
                      opacity: _animation.value,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  _SkeletonBox(
                    width: 60,
                    height: 20,
                    opacity: _animation.value,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              _SkeletonBox(
                height: 16,
                width: double.infinity,
                opacity: _animation.value,
              ),
              const SizedBox(height: AppSpacing.xs),
              _SkeletonBox(
                height: 16,
                width: 200,
                opacity: _animation.value,
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  _SkeletonBox(
                    width: 80,
                    height: 16,
                    opacity: _animation.value,
                  ),
                  const Spacer(),
                  _SkeletonBox(
                    width: 60,
                    height: 16,
                    opacity: _animation.value,
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SkeletonBox extends StatelessWidget {
  final double? width;
  final double height;
  final double opacity;

  const _SkeletonBox({
    this.width,
    required this.height,
    required this.opacity,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.brandNeutral200.withValues(alpha: 0.3 + (opacity * 0.4)),
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}