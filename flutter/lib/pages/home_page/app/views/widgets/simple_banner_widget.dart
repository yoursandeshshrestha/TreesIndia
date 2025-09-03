import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';

class BannerItem {
  final String id;
  final String image;

  const BannerItem({
    required this.id,
    required this.image,
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

  @override
  Widget build(BuildContext context) {
    print('SimpleBannerWidget build called with ${items.length} items');
    print('Items: ${items.map((item) => item.image).toList()}');
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
            height: 160, // Increased from 128px to 160px
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                return Container(
                  width: 320, // Increased from 280px to 320px
                  height: 160, // Increased from 128px to 160px
                  margin: EdgeInsets.only(
                    right: index < items.length - 1 ? 12 : 0, // gap-3 = 12px
                  ),
                  decoration: BoxDecoration(
                    borderRadius:
                        BorderRadius.circular(8), // Reduced from 12 to 8
                  ),
                  child: ClipRRect(
                    borderRadius:
                        BorderRadius.circular(8), // Reduced from 12 to 8
                    child: Image.asset(
                      item.image,
                      width: double.infinity,
                      height: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        // Debug: Print the error to see what's happening
                        print('Image loading error for ${item.image}: $error');
                        print('Stack trace: $stackTrace');
                        // Fallback image if the image fails to load
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
