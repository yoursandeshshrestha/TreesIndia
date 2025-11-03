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

class SimpleBannerWidget extends StatelessWidget {
  final String? title;
  final List<BannerItem> items;
  final String? className;

  const SimpleBannerWidget({
    super.key,
    this.title,
    required this.items,
    this.className,
  });

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
        height: double.infinity,
        fit: BoxFit.cover,
        placeholder: (context, url) => Container(
          width: double.infinity,
          height: double.infinity,
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
            height: double.infinity,
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
        height: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return Container(
            width: double.infinity,
            height: double.infinity,
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
    print('SimpleBannerWidget build called with ${items.length} items');
    print('Items: ${items.map((item) => item.image).toList()}');

    // Calculate dynamic dimensions based on screen width
    final screenWidth = MediaQuery.of(context).size.width;
    final bannerWidth = screenWidth * 0.8;
    final bannerHeight = bannerWidth / 3; // Maintain 2:1 aspect ratio

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Title (only show if title is provided)
          if (title != null) ...[
            H3Bold(
              text: title!,
              color: AppColors.brandNeutral800,
            ),
            const SizedBox(height: AppSpacing.md),
          ],
          // Banner Images
          SizedBox(
            height: bannerHeight,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                return GestureDetector(
                  onTap: () => _handleBannerTap(context, item),
                  child: Container(
                    width: bannerWidth,
                    height: bannerHeight,
                    margin: EdgeInsets.only(
                      right: index < items.length - 1 ? 12 : 0,
                    ),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.brandNeutral200,
                        width: 1,
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: _buildBannerImage(item),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
