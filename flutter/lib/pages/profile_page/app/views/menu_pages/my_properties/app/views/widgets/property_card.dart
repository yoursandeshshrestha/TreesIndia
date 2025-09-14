import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../../../domain/entities/property_entity.dart';

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

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.brandNeutral200),
        boxShadow: [
          BoxShadow(
            color: AppColors.brandNeutral200.withValues(alpha: 0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with title and status
          Row(
            children: [
              Expanded(
                child: Text(
                  property.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.brandNeutral800,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              _StatusChip(
                status: property.displayStatus,
                isApproved: property.isApproved,
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          // Location
          Row(
            children: [
              const Icon(
                Icons.location_on_outlined,
                size: 16,
                color: AppColors.brandNeutral500,
              ),
              const SizedBox(width: AppSpacing.xs),
              Expanded(
                child: Text(
                  property.displayLocation,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.brandNeutral600,
                  ),
                ),
              ),
            ],
          ),

          if (property.displayBedBath.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.xs),
            Text(
              property.displayBedBath,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.brandNeutral600,
              ),
            ),
          ],

          const SizedBox(height: AppSpacing.md),

          // Price and actions
          Row(
            children: [
              Text(
                property.displayPrice,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.stateGreen600,
                ),
              ),
              const Spacer(),
              if (isDeleting)
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              else
                InkWell(
                  onTap: onDelete,
                  borderRadius: BorderRadius.circular(4),
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.xs),
                    child: const Icon(
                      Icons.delete_outline,
                      size: 20,
                      color: AppColors.error,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
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

    if (!isApproved) {
      backgroundColor = AppColors.stateYellow100;
      textColor = AppColors.stateYellow700;
    } else if (status.toLowerCase() == 'available') {
      backgroundColor = AppColors.stateGreen100;
      textColor = AppColors.stateGreen700;
    } else {
      backgroundColor = AppColors.brandNeutral100;
      textColor = AppColors.brandNeutral600;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        isApproved ? status : 'Pending',
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: textColor,
        ),
      ),
    );
  }
}