import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/components/button/app/views/solid_button_widget.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/service_detail_entity.dart';
import '../../../../booking_page/app/providers/booking_providers.dart';

class ServiceCard extends ConsumerWidget {
  final ServiceDetailEntity service;
  final VoidCallback? onTap;

  const ServiceCard({
    super.key,
    required this.service,
    this.onTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingState = ref.watch(bookingNotifierProvider);
    return GestureDetector(
      onTap: onTap ?? () {},
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
            // Left Column - Service Info
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
                  // Price Type Badge
                  service.priceType == 'inquiry'
                      ? B3Bold(
                          text: 'Inquiry Based',
                          color: AppColors.brandPrimary700,
                        )
                      : B3Bold(
                          text: 'Fixed Price',
                          color: AppColors.brandPrimary700,
                        ),
                  const SizedBox(height: AppSpacing.xs),
                  // Price and Duration (for fixed price services)
                  if (service.priceType == 'fixed') ...[
                    B1Bold(
                      text: '₹${service.price}',
                      color: AppColors.brandNeutral900,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                  ] else ...[
                    B1Bold(
                      text: 'Inquiry Based',
                      color: AppColors.brandNeutral900,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                  ],
                  // Service Description
                  B3Regular(
                    text: service.description,
                    color: AppColors.brandNeutral600,
                    maxLines: 2,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  // Duration (if available)
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
            ),
            const SizedBox(width: AppSpacing.md),
            // Right Column - Image and Button
            Column(
              children: [
                // Service Image
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.brandNeutral100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: service.images != null && service.images!.isNotEmpty
                        ? Image.network(
                            service.images!.first,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Center(
                                child: Text(
                                  service.name.isNotEmpty
                                      ? service.name[0].toUpperCase()
                                      : 'S',
                                  style: const TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.brandNeutral600,
                                  ),
                                ),
                              );
                            },
                          )
                        : Center(
                            child: Text(
                              service.name.isNotEmpty
                                  ? service.name[0].toUpperCase()
                                  : 'S',
                              style: const TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                color: AppColors.brandNeutral600,
                              ),
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                // Book Now Button
                SizedBox(
                  width: 100,
                  child: SolidButtonWidget(
                    label: 'Book Now',
                    onPressed: () => _navigateToBookingPage(context),
                    isLoading: bookingState.isLoading,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _navigateToBookingPage(BuildContext context) {
    context.push(
      '/service/${service.id}/booking',
      extra: {
        'service': service,
      },
    );
  }
}
