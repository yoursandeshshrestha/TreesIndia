import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_widget_from_html/flutter_widget_from_html.dart';
import '../../../../commons/components/text/app/views/custom_text_library.dart';
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
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.brandNeutral900),
          onPressed: () => context.pop(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            H3Bold(
              text: widget.service.name,
              color: AppColors.brandNeutral900,
              textAlign: TextAlign.center,
            ),
            B3Regular(
              text: widget.service.categoryName,
              color: AppColors.brandNeutral600,
              textAlign: TextAlign.center,
            ),
          ],
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Service Image
            SizedBox(
              width: double.infinity,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: widget.service.images != null &&
                        widget.service.images!.isNotEmpty
                    ? Image.network(
                        widget.service.images!.first,
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            height: 200,
                            color: AppColors.brandNeutral100,
                            child: Center(
                              child: Text(
                                widget.service.name.isNotEmpty
                                    ? widget.service.name[0].toUpperCase()
                                    : 'S',
                                style: const TextStyle(
                                  fontSize: 64,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.brandNeutral600,
                                ),
                              ),
                            ),
                          );
                        },
                      )
                    : Container(
                        height: 200,
                        color: AppColors.brandNeutral100,
                        child: Center(
                          child: Text(
                            widget.service.name.isNotEmpty
                                ? widget.service.name[0].toUpperCase()
                                : 'S',
                            style: const TextStyle(
                              fontSize: 64,
                              fontWeight: FontWeight.bold,
                              color: AppColors.brandNeutral600,
                            ),
                          ),
                        ),
                      ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Service Info
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Service Name
                H3Bold(
                  text: widget.service.name,
                  color: AppColors.brandNeutral900,
                ),
                const SizedBox(height: AppSpacing.sm),

                // Category and Subcategory Badges
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
                        color: AppColors.brandPrimary600,
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
                const SizedBox(height: AppSpacing.md),

                // Price Information
                H4Bold(
                  text: 'Pricing',
                  color: AppColors.brandNeutral900,
                ),
                const SizedBox(height: 4),
                if (widget.service.priceType == 'fixed') ...[
                  Row(
                    children: [
                      H2Bold(
                        text: '₹${widget.service.price}',
                        color: AppColors.brandNeutral900,
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
                        color: AppColors.brandPrimary600,
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
                const SizedBox(height: AppSpacing.md),

                // Description
                if (widget.service.description.isNotEmpty) ...[
                  H4Bold(
                    text: 'Description',
                    color: AppColors.brandNeutral900,
                  ),
                  const SizedBox(height: 4),
                  HtmlWidget(
                    widget.service.description
                        .replaceAll(RegExp(r'\s+data-(start|end)="[^"]*"'), ''),
                    textStyle: const TextStyle(
                      color: AppColors.brandNeutral700,
                      fontSize: 14,
                      height: 1.6,
                    ),
                    customStylesBuilder: (element) {
                      if (element.localName == 'p') {
                        return {
                          'margin': '0',
                          'padding': '0',
                          'margin-bottom': '4px'
                        };
                      }
                      if (element.localName == 'body') {
                        return {'margin': '0', 'padding': '0'};
                      }
                      return null;
                    },
                  ),
                ],
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            // Service Areas
            if (widget.service.serviceAreas.isNotEmpty) ...[
              H4Bold(
                text: 'Service Areas',
                color: AppColors.brandNeutral900,
              ),
              const SizedBox(height: 4),
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
              const SizedBox(height: AppSpacing.md),
            ],
          ],
        ),
      ),

      // Bottom booking button
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(
            top: BorderSide(
              color: AppColors.brandNeutral200.withOpacity(0.3),
            ),
          ),
        ),
        child: SafeArea(
          child: SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: () => _navigateToBookingPage(),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF055c3a),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 0,
              ),
              child: bookingState.isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : Text(
                      widget.service.priceType == 'fixed'
                          ? 'Book Now'
                          : 'Submit Inquiry',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
            ),
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
