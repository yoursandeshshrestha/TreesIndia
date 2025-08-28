import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../commons/components/button/app/views/solid_button_widget.dart';
import '../../../../commons/constants/app_colors.dart';
import '../../../../commons/constants/app_spacing.dart';
import '../../domain/entities/service_detail_entity.dart';
import '../../../booking_page/app/providers/booking_providers.dart';

class ServiceDetailPage extends ConsumerStatefulWidget {
  final ServiceDetailEntity service;

  const ServiceDetailPage({
    super.key,
    required this.service,
  });

  @override
  ConsumerState<ServiceDetailPage> createState() => _ServiceDetailPageState();
}

class _ServiceDetailPageState extends ConsumerState<ServiceDetailPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(bookingNotifierProvider.notifier).loadBookingConfig();
    });
  }

  @override
  Widget build(BuildContext context) {
    final bookingState = ref.watch(bookingNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.service.name),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.brandNeutral900,
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Service Image
            Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppColors.brandPrimary50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.brandNeutral200),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: widget.service.images != null &&
                        widget.service.images!.isNotEmpty
                    ? Image.network(
                        widget.service.images!.first,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return const Center(
                            child: Icon(
                              Icons.build_outlined,
                              size: 64,
                              color: AppColors.brandPrimary600,
                            ),
                          );
                        },
                      )
                    : const Center(
                        child: Icon(
                          Icons.build_outlined,
                          size: 64,
                          color: AppColors.brandPrimary600,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Service Name
            H3Bold(
              text: widget.service.name,
              color: AppColors.brandNeutral900,
            ),
            const SizedBox(height: AppSpacing.sm),

            // Category and Subcategory
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.brandPrimary50,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: B3Bold(
                    text: widget.service.categoryName,
                    color: AppColors.brandPrimary700,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.brandNeutral100,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: B3Regular(
                    text: widget.service.subcategoryName,
                    color: AppColors.brandNeutral700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),

            // Description
            H4Bold(
              text: 'Description',
              color: AppColors.brandNeutral900,
            ),
            const SizedBox(height: AppSpacing.sm),
            B2Regular(
              text: widget.service.description,
              color: AppColors.brandNeutral700,
            ),
            const SizedBox(height: AppSpacing.lg),

            // Service Areas
            if (widget.service.serviceAreas.isNotEmpty) ...[
              H4Bold(
                text: 'Service Areas',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: widget.service.serviceAreas.map((area) {
                  return Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: AppSpacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.brandNeutral100,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: B3Regular(
                      text: '${area.city}, ${area.state}',
                      color: AppColors.brandNeutral700,
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: AppSpacing.xl),
            ],

            // Price Information
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.brandPrimary50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.brandPrimary200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  H4Bold(
                    text: 'Pricing',
                    color: AppColors.brandNeutral900,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  if (widget.service.priceType == 'fixed') ...[
                    Row(
                      children: [
                        H2Bold(
                          text: '₹${widget.service.price}',
                          color: AppColors.brandPrimary700,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        if (widget.service.duration != null)
                          B2Regular(
                            text: '(${widget.service.duration})',
                            color: AppColors.brandNeutral600,
                          ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    B3Regular(
                      text:
                          'Fixed price service - Book instantly with date and time selection',
                      color: AppColors.brandNeutral600,
                    ),
                  ] else ...[
                    Row(
                      children: [
                        const Icon(
                          Icons.contact_support_outlined,
                          color: AppColors.brandPrimary600,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        B1Bold(
                          text: 'Inquiry Required',
                          color: AppColors.brandPrimary700,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    B3Regular(
                      text:
                          'Price varies based on your requirements. Submit an inquiry and get a personalized quote.',
                      color: AppColors.brandNeutral600,
                    ),
                    if (bookingState.bookingConfig?.inquiryBookingFee !=
                        null) ...[
                      const SizedBox(height: AppSpacing.sm),
                      B3Bold(
                        text:
                            'Inquiry fee: ₹${bookingState.bookingConfig!.inquiryBookingFee}',
                        color: AppColors.brandNeutral700,
                      ),
                    ],
                  ],
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],
        ),
      ),

      // Bottom booking button
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.brandNeutral200)),
        ),
        child: SafeArea(
          child: SolidButtonWidget(
            label: widget.service.priceType == 'fixed'
                ? 'Book Now'
                : 'Submit Inquiry',
            onPressed: () => _navigateToBookingPage(),
            isLoading: bookingState.isLoading,
          ),
        ),
      ),
    );
  }

  void _navigateToBookingPage() {
    context.push(
      '/service/${widget.service.id}/booking',
      extra: {
        'service': widget.service,
      },
    );
  }
}
