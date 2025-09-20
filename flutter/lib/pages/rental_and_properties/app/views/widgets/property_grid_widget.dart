import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../../../commons/app/auth_provider.dart';
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
            child: ListView.builder(
              itemCount: properties.length + (hasMore ? 1 : 0),
              itemBuilder: (context, index) {
                if (index >= properties.length) {
                  // Load more item
                  return _LoadMoreCard(onLoadMore: onLoadMore);
                }

                return Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.lg),
                  child: PropertyCard(
                    property: properties[index],
                    onTap: () {
                      // Navigate to vendor details page using GoRouter
                      context
                          .push('/rental-properties/${properties[index].id}');
                    },
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}

class PropertyCard extends ConsumerWidget {
  final PropertyEntity property;
  final VoidCallback? onTap;

  const PropertyCard({
    super.key,
    required this.property,
    this.onTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.brandNeutral200),
          boxShadow: [
            BoxShadow(
              color: AppColors.brandNeutral200.withValues(alpha: 0.15),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Container(
              height: 200,
              width: double.infinity,
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
                color: AppColors.brandNeutral100,
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
                                text: 'TreesIndia Assured',
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

            // Content
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  H2Medium(
                    text: property.title,
                    color: AppColors.brandNeutral900,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (property.address != null &&
                      property.address!.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.xs),
                    Row(
                      children: [
                        const Icon(
                          Icons.location_on_outlined,
                          size: 16,
                          color: AppColors.brandNeutral500,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        Expanded(
                          child: B3Medium(
                            text: property.address!,
                            color: AppColors.brandNeutral600,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: AppSpacing.sm),

                  // Property Info Row
                  _buildPropertyInfoRow(),

                  const SizedBox(height: AppSpacing.sm),

                  // Price
                  Row(
                    children: [
                      H3Bold(
                        text: property.displayPrice,
                        color: AppColors.brandNeutral900,
                      ),
                      if (property.priceNegotiable) ...[
                        const SizedBox(width: AppSpacing.sm),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sm,
                            vertical: AppSpacing.xs,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.brandPrimary50,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'Negotiable',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                              color: AppColors.brandPrimary600,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),

                  const SizedBox(height: AppSpacing.md),

                  // Action Buttons
                  _buildActionButtons(context, ref),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final currentUserId = authState.token?.userId;
    final shouldShowChatButton = currentUserId != null &&
        property.userId != null &&
        currentUserId != property.userId.toString();

    return Column(
      children: [
        Row(
          children: [
            // View Number Button
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  // TODO: Implement view number functionality
                },
                icon: const Icon(
                  Icons.phone,
                  size: 16,
                  color: AppColors.stateGreen600,
                ),
                label: const Text(
                  'View Number',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppColors.stateGreen600,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.stateGreen600),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
              ),
            ),

            const SizedBox(width: AppSpacing.sm),
            // Contact Button
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  // TODO: Implement contact functionality
                },
                icon: const Icon(
                  Icons.contact_page,
                  size: 16,
                  color: AppColors.brandNeutral600,
                ),
                label: const Text(
                  'Contact',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppColors.brandNeutral600,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.brandNeutral400),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
              ),
            ),
          ],
        ),
        if (shouldShowChatButton) ...[
          const SizedBox(height: AppSpacing.sm),
          // Chat Button
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    // TODO: Implement chat functionality
                  },
                  icon: const Icon(
                    Icons.chat,
                    size: 16,
                    color: Colors.white,
                  ),
                  label: const Text(
                    'Chat',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Colors.white,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.stateGreen600,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  String _getPropertyAge(String age) {
    switch (age.toLowerCase()) {
      case 'under_1_year':
        return 'Under 1 year';
      case '1_2_years':
        return '1-2 years';
      case '2_5_years':
        return '2-5 years';
      case '5_10_years':
        return '5-10 years';
      case '10_plus_years':
        return '10+ years';
      default:
        return age;
    }
  }

  Widget _buildPropertyInfoRow() {
    return Row(
      children: [
        if (property.displayArea != 'Area not specified') ...[
          _buildInfoChip(property.displayArea, Icons.square_foot),
          const SizedBox(width: AppSpacing.sm),
        ],
        if (property.displayBedBath.isNotEmpty) ...[
          _buildInfoChip(property.displayBedBath, Icons.bed_outlined),
          const SizedBox(width: AppSpacing.sm),
        ],
        if (property.age != null && property.age!.isNotEmpty) ...[
          _buildInfoChip(
              _getPropertyAge(property.age!), Icons.calendar_today_outlined),
          const SizedBox(width: AppSpacing.sm),
        ],
      ],
    );
  }

  Widget _buildInfoChip(String text, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: AppColors.brandNeutral50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: AppColors.brandNeutral600,
          ),
          const SizedBox(width: AppSpacing.xs),
          Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: AppColors.brandNeutral700,
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
