import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:trees_india/commons/components/button/app/views/outline_button_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/booking_details_entity.dart';
import '../../providers/bookings_providers.dart';
import 'booking_details_bottom_sheet.dart';
import 'cancel_booking_bottom_sheet.dart';

class BookingCardWidget extends ConsumerWidget {
  final BookingDetailsEntity booking;

  const BookingCardWidget({
    super.key,
    required this.booking,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsNotifier = ref.read(bookingsNotifierProvider.notifier);
    final bookingsState = ref.watch(bookingsNotifierProvider);

    return GestureDetector(
      onTap: () => BookingDetailsBottomSheet.show(context, booking),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.brandNeutral100,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.brandNeutral200),
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: H4Bold(
                      text: booking.service.name,
                      color: AppColors.brandNeutral800,
                    ),
                  ),
                  _buildStatusChip(booking.status),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  const Icon(
                    Icons.confirmation_number_outlined,
                    size: 16,
                    color: AppColors.brandNeutral600,
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  B3Medium(
                    text: booking.bookingReference,
                    color: AppColors.brandNeutral600,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xs),
              Row(
                children: [
                  const Icon(
                    Icons.schedule,
                    size: 16,
                    color: AppColors.brandNeutral600,
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  B3Medium(
                    text: booking.scheduledDate != null &&
                            booking.scheduledTime != null
                        ? _formatDateTime(
                            booking.scheduledDate!, booking.scheduledTime!)
                        : 'To be scheduled after quote acceptance',
                    color: AppColors.brandNeutral600,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xs),
              Row(
                children: [
                  const Icon(
                    Icons.location_on_outlined,
                    size: 16,
                    color: AppColors.brandNeutral600,
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: B3Medium(
                      text: '${booking.address.name}, ${booking.address.city}',
                      color: AppColors.brandNeutral600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      _buildPaymentStatusChip(booking.paymentStatus),
                      const SizedBox(width: AppSpacing.sm),
                      B3Bold(
                        text: booking.bookingType.toUpperCase(),
                        color: AppColors.brandNeutral500,
                      ),
                    ],
                  ),
                  if (booking.service.price != null)
                    B3Medium(
                      text: '₹${booking.service.price}',
                      color: AppColors.brandPrimary600,
                    ),
                ],
              ),
              if (booking.status.toLowerCase() != 'cancelled' &&
                  booking.status.toLowerCase() != 'assigned') ...[
                const SizedBox(height: AppSpacing.sm),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButtonWidget(
                    label: bookingsState.isCancelling
                        ? 'Cancelling...'
                        : 'Cancel Booking',
                    labelColor: AppColors.stateRed600,
                    borderColor: AppColors.stateRed600,
                    onPressed: bookingsState.isCancelling
                        ? null
                        : () async {
                            final result = await CancelBookingBottomSheet.show(
                              context,
                              booking.bookingReference,
                            );

                            if (result != null && context.mounted) {
                              try {
                                await bookingsNotifier.cancelBooking(
                                  bookingId: booking.id,
                                  reason: result['reason']!,
                                  cancellationReason:
                                      result['cancellation_reason']!.isEmpty
                                          ? null
                                          : result['cancellation_reason'],
                                );
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                          'Booking cancelled successfully'),
                                      backgroundColor: Colors.green,
                                    ),
                                  );
                                }
                              } catch (e) {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                          'Failed to cancel booking: ${e.toString()}'),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                }
                              }
                            }
                          },
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color backgroundColor;
    Color textColor;

    switch (status.toLowerCase()) {
      case 'confirmed':
        backgroundColor = AppColors.stateGreen100;
        textColor = AppColors.stateGreen600;
        break;
      case 'pending':
        backgroundColor = AppColors.brandSecondary100;
        textColor = AppColors.brandSecondary600;
        break;
      case 'completed':
        backgroundColor = AppColors.stateGreen100;
        textColor = AppColors.stateGreen700;
        break;
      case 'cancelled':
        backgroundColor = AppColors.stateRed100;
        textColor = AppColors.stateRed600;
        break;
      case 'in_progress':
        backgroundColor = AppColors.accentTeal100;
        textColor = AppColors.accentTeal600;
        break;
      default:
        backgroundColor = AppColors.brandNeutral200;
        textColor = AppColors.brandNeutral600;
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
      child: B3Bold(
        text: _formatStatus(status),
        color: textColor,
      ),
    );
  }

  Widget _buildPaymentStatusChip(String paymentStatus) {
    Color backgroundColor;
    Color textColor;
    IconData icon;

    switch (paymentStatus.toLowerCase()) {
      case 'completed':
        backgroundColor = AppColors.stateGreen100;
        textColor = AppColors.stateGreen600;
        icon = Icons.check_circle_outline;
        break;
      case 'pending':
        backgroundColor = AppColors.brandSecondary100;
        textColor = AppColors.brandSecondary600;
        icon = Icons.schedule;
        break;
      case 'failed':
        backgroundColor = AppColors.stateRed100;
        textColor = AppColors.stateRed600;
        icon = Icons.error_outline;
        break;
      case 'refunded':
        backgroundColor = AppColors.accentPurple100;
        textColor = AppColors.accentPurple600;
        icon = Icons.replay;
        break;
      default:
        backgroundColor = AppColors.brandNeutral200;
        textColor = AppColors.brandNeutral600;
        icon = Icons.payment;
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
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 12,
            color: textColor,
          ),
          const SizedBox(width: AppSpacing.xs / 2),
          B3Bold(
            text: _formatPaymentStatus(paymentStatus),
            color: textColor,
          ),
        ],
      ),
    );
  }

  String _formatStatus(String status) {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return 'In Progress';
      case 'quote_provided':
        return 'Quote Provided';
      case 'quote_accepted':
        return 'Quote Accepted';
      default:
        return status
            .split('_')
            .map((word) => word[0].toUpperCase() + word.substring(1))
            .join(' ');
    }
  }

  String _formatPaymentStatus(String status) {
    return status
        .split('_')
        .map((word) => word[0].toUpperCase() + word.substring(1))
        .join(' ');
  }

  String _formatDateTime(DateTime date, DateTime time) {
    final dateFormat = DateFormat('MMM dd, yyyy');
    final timeFormat = DateFormat('hh:mm a');

    DateTime indianTime;

    if (time.isUtc) {
      // Convert UTC to IST (UTC+5:30)
      indianTime = time.add(const Duration(hours: 5, minutes: 30));
    } else {
      // Assume it's already in IST
      indianTime = time;
    }

    return '${dateFormat.format(date)} at ${timeFormat.format(indianTime)}';
  }
}
