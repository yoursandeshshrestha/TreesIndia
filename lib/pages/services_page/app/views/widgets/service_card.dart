import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/service_entity.dart';

class ServiceCard extends StatelessWidget {
  final ServiceEntity service;
  final VoidCallback onTap;

  const ServiceCard({
    super.key,
    required this.service,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.brandNeutral200),
          boxShadow: [
            BoxShadow(
              color: AppColors.brandNeutral900.withValues(alpha: 0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Service Image
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.brandPrimary50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.brandNeutral200),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: service.images.isNotEmpty
                    ? Image.network(
                        service.images.first,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return const Center(
                            child: Icon(
                              Icons.build_outlined,
                              size: 32,
                              color: AppColors.brandPrimary600,
                            ),
                          );
                        },
                      )
                    : const Center(
                        child: Icon(
                          Icons.build_outlined,
                          size: 32,
                          color: AppColors.brandPrimary600,
                        ),
                      ),
              ),
            ),
            const SizedBox(width: AppSpacing.lg),
            // Service Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Service Name
                  B1Bold(
                    text: service.name,
                    color: AppColors.brandNeutral900,
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  // Service Description
                  B3Regular(
                    text: service.description,
                    color: AppColors.brandNeutral600,
                    maxLines: 2,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  // Price, Duration or Inquiry Badge
                  service.priceType == 'inquiry'
                      ? Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sm,
                            vertical: AppSpacing.xs,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.brandPrimary100,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.contact_support_outlined,
                                size: 16,
                                color: AppColors.brandPrimary700,
                              ),
                              const SizedBox(width: 4),
                              B3Bold(
                                text: 'Inquiry Required',
                                color: AppColors.brandPrimary700,
                              ),
                            ],
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            // Price
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.sm,
                                vertical: AppSpacing.xs,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.brandPrimary50,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: B2Bold(
                                text: '₹${service.price}',
                                color: AppColors.brandPrimary700,
                              ),
                            ),
                            // Duration
                            if (service.duration != null)
                              Row(
                                children: [
                                  const Icon(
                                    Icons.access_time,
                                    size: 16,
                                    color: AppColors.brandNeutral500,
                                  ),
                                  const SizedBox(width: 4),
                                  B3Regular(
                                    text: service.duration!,
                                    color: AppColors.brandNeutral500,
                                  ),
                                ],
                              ),
                          ],
                        ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}