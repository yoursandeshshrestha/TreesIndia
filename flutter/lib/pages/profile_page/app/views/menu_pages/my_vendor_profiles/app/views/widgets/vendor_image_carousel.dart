import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class VendorImageCarousel extends StatefulWidget {
  final List<String> images;

  const VendorImageCarousel({
    super.key,
    required this.images,
  });

  @override
  State<VendorImageCarousel> createState() => _VendorImageCarouselState();
}

class _VendorImageCarouselState extends State<VendorImageCarousel> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.images.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      children: [
        // Image Carousel
        SizedBox(
          height: 250,
          child: PageView.builder(
            controller: _pageController,
            onPageChanged: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            itemCount: widget.images.length,
            itemBuilder: (context, index) {
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    widget.images[index],
                    fit: BoxFit.cover,
                    width: double.infinity,
                    errorBuilder: (context, error, stackTrace) {
                      return _buildImagePlaceholder();
                    },
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return _buildImagePlaceholder();
                    },
                  ),
                ),
              );
            },
          ),
        ),

        const SizedBox(height: AppSpacing.md),

        // Image Counter and Navigation
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Previous Button
            if (widget.images.length > 1)
              IconButton(
                onPressed: _currentIndex > 0
                    ? () => _pageController.previousPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        )
                    : null,
                icon: Icon(
                  Icons.arrow_back_ios_rounded,
                  color: _currentIndex > 0
                      ? AppColors.brandNeutral600
                      : AppColors.brandNeutral300,
                ),
              ),

            const SizedBox(width: AppSpacing.md),

            // Page Indicators
            Expanded(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Image Counter
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: AppSpacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.brandNeutral800,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      '${_currentIndex + 1}/${widget.images.length}',
                      style: const TextStyle(
                        color: AppColors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),

                  const SizedBox(width: AppSpacing.md),

                  // Dot Indicators
                  if (widget.images.length <= 5)
                    ...List.generate(
                      widget.images.length,
                      (index) => Container(
                        width: 8,
                        height: 8,
                        margin: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.xs / 2,
                        ),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: index == _currentIndex
                              ? AppColors.brandPrimary600
                              : AppColors.brandNeutral300,
                        ),
                      ),
                    ),
                ],
              ),
            ),

            const SizedBox(width: AppSpacing.md),

            // Next Button
            if (widget.images.length > 1)
              IconButton(
                onPressed: _currentIndex < widget.images.length - 1
                    ? () => _pageController.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        )
                    : null,
                icon: Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: _currentIndex < widget.images.length - 1
                      ? AppColors.brandNeutral600
                      : AppColors.brandNeutral300,
                ),
              ),
          ],
        ),
      ],
    );
  }

  Widget _buildImagePlaceholder() {
    return Container(
      width: double.infinity,
      height: 250,
      decoration: BoxDecoration(
        color: AppColors.brandNeutral100,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.image_outlined,
            size: 48,
            color: AppColors.brandNeutral400,
          ),
          SizedBox(height: AppSpacing.sm),
          Text(
            'Failed to load image',
            style: TextStyle(
              color: AppColors.brandNeutral500,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}
