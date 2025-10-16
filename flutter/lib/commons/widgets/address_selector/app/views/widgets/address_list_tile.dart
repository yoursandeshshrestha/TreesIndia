import 'package:flutter/material.dart';
import '../../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../../commons/constants/app_colors.dart';
import '../../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/address_entity.dart';

class AddressListTile extends StatelessWidget {
  final AddressEntity address;
  final bool isSelected;
  final VoidCallback? onTap;
  final void Function(AddressEntity address)? onEdit;
  final void Function(int addressId)? onDelete;

  const AddressListTile({
    super.key,
    required this.address,
    this.isSelected = false,
    this.onTap,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.stateGreen50 : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color:
                isSelected ? AppColors.stateGreen600 : AppColors.stateGreen200,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header row with name and actions
            Row(
              children: [
                // Name and default indicator
                Expanded(
                  child: Row(
                    children: [
                      B2Bold(
                        text: address.name,
                        color: isSelected
                            ? AppColors.stateGreen700
                            : AppColors.stateGreen900,
                      ),
                      if (address.isDefault) ...[
                        const SizedBox(width: AppSpacing.sm),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sm,
                            vertical: AppSpacing.xs,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.stateGreen100,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: B4Bold(
                            text: 'DEFAULT',
                            color: AppColors.stateGreen700,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                // Action buttons
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (onEdit != null)
                      IconButton(
                        onPressed: () => onEdit?.call(address),
                        icon: const Icon(
                          Icons.edit_outlined,
                          size: 18,
                          color: AppColors.stateGreen600,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 32,
                          minHeight: 32,
                        ),
                        padding: const EdgeInsets.all(AppSpacing.xs),
                      ),
                    if (onDelete != null && !address.isDefault)
                      IconButton(
                        onPressed: () => onDelete?.call(address.id),
                        icon: const Icon(
                          Icons.delete_outline,
                          size: 18,
                          color: Colors.red,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 32,
                          minHeight: 32,
                        ),
                        padding: const EdgeInsets.all(AppSpacing.xs),
                      ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.sm),

            // Address details
            B3Regular(
              text: address.fullAddress,
              color: AppColors.stateGreen700,
              maxLines: 3,
            ),

            // Selected indicator
            if (isSelected) ...[
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  const Icon(
                    Icons.check_circle,
                    size: 16,
                    color: AppColors.stateGreen600,
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  B4Bold(
                    text: 'Selected',
                    color: AppColors.stateGreen600,
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
