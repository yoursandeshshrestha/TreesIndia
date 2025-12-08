import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';

class BannerItem {
  final String id;
  final String image;
  final String? link;
  final bool isNetworkImage;

  const BannerItem({
    required this.id,
    required this.image,
    this.link,
    this.isNetworkImage = false,
  });
}

class SimpleBannerWidget extends StatefulWidget {
  final String? title;
  final List<BannerItem> items;
  final String? className;

  const SimpleBannerWidget({
    super.key,
    this.title,
    required this.items,
    this.className,
  });

  @override
  State<SimpleBannerWidget> createState() => _SimpleBannerWidgetState();
}

class _SimpleBannerWidgetState extends State<SimpleBannerWidget> {
  late PageController _pageController;
  Timer? _timer;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    if (widget.items.length > 1) {
      _startAutoSlide();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startAutoSlide() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (_pageController.hasClients) {
        if (_currentPage < widget.items.length - 1) {
          _currentPage++;
        } else {
          _currentPage = 0;
        }
        _pageController.animateToPage(
          _currentPage,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentPage = index;
    });
    // Restart auto-slide timer when user manually swipes
    if (widget.items.length > 1) {
      _startAutoSlide();
    }
  }

  void _handleBannerTap(BuildContext context, BannerItem item) {
    if (item.link == null || item.link!.isEmpty) return;

    final link = item.link!;

    // Parse the link and extract route and query parameters
    final uri = Uri.parse(link);
    final path = uri.path;
    final queryParams = uri.queryParameters;

    // Build the full route with query parameters
    if (queryParams.isNotEmpty) {
      final queryString =
          queryParams.entries.map((e) => '${e.key}=${e.value}').join('&');
      context.push('$path?$queryString');
    } else {
      context.push(path);
    }
  }

  Widget _buildBannerImage(BannerItem item) {
    if (item.isNetworkImage) {
      return CachedNetworkImage(
        imageUrl: item.image,
        width: double.infinity,
        fit: BoxFit.fitWidth,
        placeholder: (context, url) => Container(
          width: double.infinity,
          color: Colors.grey[300],
          child: const Center(
            child: CircularProgressIndicator(
              color: AppColors.stateGreen600,
            ),
          ),
        ),
        errorWidget: (context, url, error) {
          return Container(
            width: double.infinity,
            color: Colors.grey[300],
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.image,
                  size: 40,
                  color: Colors.grey,
                ),
                SizedBox(height: 8),
                Text(
                  'Failed to load image',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          );
        },
      );
    } else {
      return Image.asset(
        item.image,
        width: double.infinity,
        fit: BoxFit.fitWidth,
        errorBuilder: (context, error, stackTrace) {
          return Container(
            width: double.infinity,
            color: Colors.grey[300],
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.image,
                  size: 40,
                  color: Colors.grey,
                ),
                const SizedBox(height: 8),
                Text(
                  'Failed to load\n${item.image}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 10,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          );
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (kDebugMode) {
      print(
          'SimpleBannerWidget build called with ${widget.items.length} items');
      print('Items: ${widget.items.map((item) => item.image).toList()}');
    }

    if (widget.items.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Title (only show if title is provided)
          if (widget.title != null) ...[
            H3Bold(
              text: widget.title!,
              color: AppColors.brandNeutral800,
            ),
            const SizedBox(height: AppSpacing.md),
          ],
          // Banner Images - Auto Height, Full Width
          AspectRatio(
            aspectRatio: 16 / 9, // Default aspect ratio, image will fit within
            child: SizedBox(
              width: double.infinity,
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: _onPageChanged,
                itemCount: widget.items.length,
                itemBuilder: (context, index) {
                  final item = widget.items[index];
                  return GestureDetector(
                    onTap: () => _handleBannerTap(context, item),
                    child: Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppColors.brandNeutral200,
                          width: 1,
                        ),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: _buildBannerImage(item),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          // Page Indicator
          if (widget.items.length > 1) ...[
            const SizedBox(height: AppSpacing.sm),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                widget.items.length,
                (index) => Container(
                  width: 8,
                  height: 8,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _currentPage == index
                        ? AppColors.stateGreen600
                        : AppColors.brandNeutral300,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
