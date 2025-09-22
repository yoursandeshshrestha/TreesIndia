import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/pages/bookings_page/domain/entities/booking_details_entity.dart';

class PaymentSegmentsBottomSheet extends StatefulWidget {
  final BookingDetailsEntity booking;

  const PaymentSegmentsBottomSheet({
    super.key,
    required this.booking,
  });

  @override
  State<PaymentSegmentsBottomSheet> createState() =>
      _PaymentSegmentsBottomSheetState();
}

class _PaymentSegmentsBottomSheetState extends State<PaymentSegmentsBottomSheet>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _progressAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _progressAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    // Start animation when bottom sheet opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _animationController.forward();
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final paymentProgress = widget.booking.paymentProgress;
    final paymentSegments = widget.booking.paymentSegments ?? [];

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: DraggableScrollableSheet(
        initialChildSize: 0.8,
        minChildSize: 0.5,
        maxChildSize: 0.8,
        expand: false,
        builder: (context, scrollController) {
          return Column(
            children: [
              _buildHeader(context),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildPaymentProgress(paymentProgress),
                      const SizedBox(height: AppSpacing.xl),
                      _buildPaymentSegments(paymentSegments),
                    ],
                  ),
                ),
              ),
              _buildBottomButton(context),
            ],
          );
        },
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          Container(
            height: 4,
            width: 40,
            decoration: BoxDecoration(
              color: AppColors.brandNeutral300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    H4Bold(
                      text: 'Payment Segments',
                      color: AppColors.brandNeutral800,
                    ),
                    const SizedBox(height: 4),
                    B3Medium(
                      text:
                          'Booking #${widget.booking.bookingReference} - ${widget.booking.service.name}',
                      color: AppColors.brandNeutral600,
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
                color: AppColors.brandNeutral600,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentProgress(paymentProgress) {
    final progressPercentage = paymentProgress != null
        ? (paymentProgress.progressPercentage / 100).clamp(0.0, 1.0)
        : 0.0;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.brandNeutral50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          B2Bold(
            text: 'Payment Progress',
            color: AppColors.brandNeutral800,
          ),
          const SizedBox(height: AppSpacing.sm),
          if (paymentProgress != null) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                B3Medium(
                  text:
                      '${paymentProgress.paidSegments} of ${paymentProgress.totalSegments} segments paid',
                  color: AppColors.brandNeutral600,
                ),
              ],
            ),
          ] else ...[
            B3Medium(
              text: 'No payment information available',
              color: AppColors.brandNeutral600,
            ),
          ],
          const SizedBox(height: AppSpacing.md),
          // Animated Progress Bar
          Stack(
            children: [
              Container(
                height: 8,
                width: double.maxFinite,
                decoration: BoxDecoration(
                  color: AppColors.brandNeutral200,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.brandNeutral200,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              Container(
                height: 8,
                decoration: BoxDecoration(
                  color: AppColors.brandNeutral200,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: AnimatedBuilder(
                  animation: _progressAnimation,
                  builder: (context, child) {
                    final animatedProgress = paymentProgress != null
                        ? progressPercentage * _progressAnimation.value
                        : 0.0;

                    return FractionallySizedBox(
                      alignment: Alignment.centerLeft,
                      widthFactor: animatedProgress,
                      child: Container(
                        decoration: BoxDecoration(
                          color: paymentProgress != null
                              ? AppColors.brandPrimary600
                              : AppColors.brandNeutral300,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          // Payment Summary
          if (paymentProgress != null) ...[
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      B4Regular(
                        text: 'Total Amount',
                        color: AppColors.brandNeutral500,
                      ),
                      const SizedBox(height: 2),
                      B3Bold(
                        text:
                            '₹${paymentProgress.totalAmount.toStringAsFixed(0)}',
                        color: AppColors.brandNeutral800,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      B4Regular(
                        text: 'Paid Amount',
                        color: AppColors.brandNeutral500,
                      ),
                      const SizedBox(height: 2),
                      B3Bold(
                        text:
                            '₹${paymentProgress.paidAmount.toStringAsFixed(0)}',
                        color: AppColors.stateGreen600,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      B4Regular(
                        text: 'Remaining',
                        color: AppColors.brandNeutral500,
                      ),
                      const SizedBox(height: 2),
                      B3Bold(
                        text:
                            '₹${paymentProgress.remainingAmount.toStringAsFixed(0)}',
                        color: AppColors.brandNeutral800,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
              child: Center(
                child: B3Medium(
                  text: 'Payment details will appear here once available',
                  color: AppColors.brandNeutral500,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPaymentSegments(List<dynamic> segments) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H4Bold(
          text: 'Payment Segments',
          color: AppColors.brandNeutral800,
        ),
        const SizedBox(height: AppSpacing.md),
        ...segments.map((segment) => _buildSegmentCard(segment)),
      ],
    );
  }

  Widget _buildSegmentCard(dynamic segment) {
    final isPaid = segment.status.toLowerCase() == 'paid';
    final isPending = segment.status.toLowerCase() == 'pending';

    Color statusColor = AppColors.brandNeutral600;
    Color statusBackgroundColor = AppColors.brandNeutral100;
    String statusText = segment.status.toUpperCase();

    if (isPaid) {
      statusColor = AppColors.stateGreen600;
      statusBackgroundColor = AppColors.stateGreen100;
    } else if (isPending) {
      statusColor = AppColors.brandSecondary600;
      statusBackgroundColor = AppColors.brandSecondary100;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              H4Bold(
                text: 'Segment #${segment.segmentNumber}',
                color: AppColors.brandNeutral800,
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: statusBackgroundColor,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: B4Bold(
                  text: statusText,
                  color: statusColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              const Icon(
                Icons.calendar_today_outlined,
                size: 16,
                color: AppColors.brandNeutral600,
              ),
              const SizedBox(width: AppSpacing.xs),
              B3Medium(
                text: segment.dueDate != null
                    ? DateFormat('dd/MM/yyyy').format(segment.dueDate)
                    : 'No due date',
                color: AppColors.brandNeutral600,
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              B2Bold(
                text: '₹${segment.amount.toStringAsFixed(0)}',
                color: AppColors.brandNeutral800,
              ),
              if (isPaid && segment.paidAt != null)
                B4Regular(
                  text:
                      'Paid on ${DateFormat('dd/MM/yyyy').format(segment.paidAt)}',
                  color: AppColors.stateGreen600,
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBottomButton(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: AppColors.brandNeutral200),
        ),
      ),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: () => Navigator.pop(context),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.brandNeutral600,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          child: const Text('Close'),
        ),
      ),
    );
  }
}
