import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../../../domain/entities/property_entity.dart';
import 'property_detail_bottom_sheet.dart';

class PropertyCard extends StatelessWidget {
  final PropertyEntity property;
  final bool isDeleting;
  final VoidCallback onDelete;

  const PropertyCard({
    super.key,
    required this.property,
    this.isDeleting = false,
    required this.onDelete,
  });

  void _showPropertyDetails(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PropertyDetailBottomSheet(
        property: property,
        onDelete: onDelete,
        isDeleting: isDeleting,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showPropertyDetails(context),
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
            // Property Image with Status Badge
            _buildImageSection(),

            // Property Details
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and Location
                  _buildTitleSection(),

                  const SizedBox(height: AppSpacing.sm),

                  // Property Info Row
                  _buildPropertyInfoRow(),

                  const SizedBox(height: AppSpacing.sm),

                  // Price
                  _buildPriceSection(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImageSection() {
    return Container(
      height: 200,
      width: double.infinity,
      decoration: const BoxDecoration(
        borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
        color: AppColors.brandNeutral100,
      ),
      child: Stack(
        children: [
          // Property Image
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            child: property.primaryImage.isNotEmpty
                ? Image.network(
                    property.primaryImage,
                    width: double.infinity,
                    height: 200,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) =>
                        _buildPlaceholder(),
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return _buildPlaceholder();
                    },
                  )
                : _buildPlaceholder(),
          ),

          // Status Badge
          Positioned(
            top: AppSpacing.sm,
            left: AppSpacing.sm,
            child: _StatusChip(
              status: property.displayStatus,
              isApproved: property.isApproved,
            ),
          ),

          // Image Count Badge (if multiple images)
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
                  color: AppColors.brandNeutral800.withValues(alpha: 0.8),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.photo_library_outlined,
                      color: AppColors.white,
                      size: 14,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Text(
                      '${property.imageCount}',
                      style: const TextStyle(
                        color: AppColors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      width: double.infinity,
      height: 200,
      color: AppColors.brandNeutral100,
      child: const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.home_outlined,
            size: 48,
            color: AppColors.brandNeutral400,
          ),
          SizedBox(height: AppSpacing.sm),
          Text(
            'No Image',
            style: TextStyle(
              color: AppColors.brandNeutral500,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTitleSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H2Medium(
          text: property.title,
          color: AppColors.brandNeutral900,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        if (property.address != null && property.address!.isNotEmpty) ...[
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
        ]
      ],
    );
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

  Widget _buildPriceSection() {
    return Row(
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
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;
  final bool isApproved;

  const _StatusChip({
    required this.status,
    required this.isApproved,
  });

  @override
  Widget build(BuildContext context) {
    Color backgroundColor;
    Color textColor;
    String displayText;

    if (!isApproved) {
      backgroundColor = AppColors.brandNeutral400;
      textColor = AppColors.brandNeutral800;
      displayText = 'Pending';
    } else if (status.toLowerCase() == 'available') {
      backgroundColor = AppColors.stateGreen100;
      textColor = AppColors.stateGreen700;
      displayText = 'Available';
    } else if (status.toLowerCase() == 'sold') {
      backgroundColor = AppColors.brandNeutral100;
      textColor = AppColors.brandNeutral600;
      displayText = 'Sold';
    } else if (status.toLowerCase() == 'rented') {
      backgroundColor = AppColors.brandNeutral100;
      textColor = AppColors.brandNeutral600;
      displayText = 'Rented';
    } else {
      backgroundColor = AppColors.brandNeutral100;
      textColor = AppColors.brandNeutral600;
      displayText = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        displayText,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: textColor,
          letterSpacing: 0.3,
        ),
      ),
    );
  }
}
