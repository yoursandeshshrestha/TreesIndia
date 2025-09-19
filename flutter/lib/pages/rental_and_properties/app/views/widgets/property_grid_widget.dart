import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../../profile_page/app/views/menu_pages/my_properties/domain/entities/property_entity.dart';

class PropertyGridWidget extends StatelessWidget {
  final List<PropertyEntity> properties;
  final bool isLoading;
  final bool hasError;
  final String? errorMessage;
  final bool isEmpty;
  final bool hasMore;
  final VoidCallback onLoadMore;
  final VoidCallback onRetry;

  const PropertyGridWidget({
    super.key,
    required this.properties,
    required this.isLoading,
    required this.hasError,
    this.errorMessage,
    required this.isEmpty,
    required this.hasMore,
    required this.onLoadMore,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    if (hasError) {
      return _ErrorWidget(
        message: errorMessage ?? 'Failed to load properties',
        onRetry: onRetry,
      );
    }

    if (isLoading && properties.isEmpty) {
      return const _LoadingWidget();
    }

    if (isEmpty) {
      return const _EmptyWidget();
    }

    return Column(
      children: [
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 1,
                crossAxisSpacing: AppSpacing.md,
                mainAxisSpacing: AppSpacing.md,
                childAspectRatio: 0.8,
              ),
              itemCount: properties.length + (hasMore ? 1 : 0),
              itemBuilder: (context, index) {
                if (index >= properties.length) {
                  // Load more item
                  return _LoadMoreCard(onLoadMore: onLoadMore);
                }

                return PropertyCard(property: properties[index]);
              },
            ),
          ),
        ),
      ],
    );
  }
}

class PropertyCard extends StatelessWidget {
  final PropertyEntity property;

  const PropertyCard({
    super.key,
    required this.property,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          Expanded(
            flex: 3,
            child: Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
              ),
              child: ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(12)),
                child: Stack(
                  children: [
                    property.images.isNotEmpty
                        ? Image.network(
                            property.images.first,
                            width: double.infinity,
                            height: double.infinity,
                            fit: BoxFit.cover,
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return Container(
                                color: AppColors.brandNeutral100,
                                child: const Center(
                                  child: CircularProgressIndicator(),
                                ),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) =>
                                Container(
                              color: AppColors.brandNeutral100,
                              child: const Icon(
                                Icons.image_not_supported,
                                color: AppColors.brandNeutral400,
                                size: 32,
                              ),
                            ),
                          )
                        : Container(
                            color: AppColors.brandNeutral100,
                            child: const Icon(
                              Icons.home,
                              color: AppColors.brandNeutral400,
                              size: 32,
                            ),
                          ),

                    // Trees India Assured Badge
                    if (property.treesindiaAssured)
                      Positioned(
                        top: AppSpacing.sm,
                        left: AppSpacing.sm,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sm,
                            vertical: AppSpacing.xs,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.stateGreen600,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.verified,
                                color: Colors.white,
                                size: 12,
                              ),
                              const SizedBox(width: AppSpacing.xs),
                              B3Bold(
                                text: 'Assured',
                                color: Colors.white,
                              ),
                            ],
                          ),
                        ),
                      ),

                    // Image count
                    if (property.hasMultipleImages)
                      Positioned(
                        bottom: AppSpacing.sm,
                        right: AppSpacing.sm,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sm,
                            vertical: AppSpacing.xs,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.photo_library,
                                color: Colors.white,
                                size: 12,
                              ),
                              const SizedBox(width: AppSpacing.xs),
                              B3Regular(
                                text: '${property.imageCount}',
                                color: Colors.white,
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),

          // Content
          Expanded(
            flex: 2,
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  B2Bold(
                    text: property.title,
                    color: AppColors.brandNeutral900,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: AppSpacing.xs),

                  // Location
                  B3Regular(
                    text: property.displayLocation,
                    color: AppColors.brandNeutral600,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  // Details
                  if (property.displayBedBath.isNotEmpty)
                    B3Regular(
                      text: property.displayBedBath,
                      color: AppColors.brandNeutral700,
                    ),
                  if (property.area != null)
                    B3Regular(
                      text: property.displayArea,
                      color: AppColors.brandNeutral700,
                    ),

                  const Spacer(),

                  // Price
                  B2Bold(
                    text: property.displayPrice,
                    color: AppColors.stateGreen600,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LoadingWidget extends StatelessWidget {
  const _LoadingWidget();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: CircularProgressIndicator(
        color: AppColors.stateGreen600,
      ),
    );
  }
}

class _ErrorWidget extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorWidget({
    required this.message,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 48,
              color: AppColors.stateRed600,
            ),
            const SizedBox(height: AppSpacing.lg),
            B2Regular(
              text: message,
              color: AppColors.brandNeutral700,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.lg),
            ElevatedButton(
              onPressed: onRetry,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.stateGreen600,
                foregroundColor: Colors.white,
              ),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyWidget extends StatelessWidget {
  const _EmptyWidget();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.search_off,
              size: 48,
              color: AppColors.brandNeutral400,
            ),
            const SizedBox(height: AppSpacing.lg),
            H3Bold(
              text: 'No Properties Found',
              color: AppColors.brandNeutral700,
            ),
            const SizedBox(height: AppSpacing.md),
            B2Regular(
              text: 'Try adjusting your filters to see more results',
              color: AppColors.brandNeutral600,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _LoadMoreCard extends StatelessWidget {
  final VoidCallback onLoadMore;

  const _LoadMoreCard({
    required this.onLoadMore,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onLoadMore,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.stateGreen600,
            width: 2,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.add_circle_outline,
              size: 48,
              color: AppColors.stateGreen600,
            ),
            const SizedBox(height: AppSpacing.md),
            B2Bold(
              text: 'Load More',
              color: AppColors.stateGreen600,
            ),
          ],
        ),
      ),
    );
  }
}
