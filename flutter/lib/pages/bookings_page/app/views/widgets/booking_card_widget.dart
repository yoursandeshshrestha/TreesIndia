import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:trees_india/commons/components/snackbar/app/views/error_snackbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/success_snackbar_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/pages/bookings_page/app/viewmodels/bookings_notifier.dart';
import 'package:trees_india/pages/bookings_page/app/viewmodels/bookings_state.dart';
import 'package:trees_india/commons/widgets/location_tracking_modal.dart';

import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../domain/entities/booking_details_entity.dart';
import '../../providers/bookings_providers.dart';
import 'booking_details_bottom_sheet.dart';
import 'cancel_booking_bottom_sheet.dart';
import 'payment_segments_bottom_sheet.dart';
import 'quote_acceptance_bottom_sheet.dart';

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
        child: Column(
          children: [
            // Top Side - Status and Service Info
            Padding(
              padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md, AppSpacing.md, AppSpacing.md, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Status Header with Icon and Service Name
                  Row(
                    children: [
                      _getStatusIcon(booking.status, booking.paymentStatus),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            H4Bold(
                              text: booking.service.name,
                              color: AppColors.brandNeutral800,
                            ),
                            const SizedBox(height: 2),
                            B3Medium(
                              text: _getStatusSubtitle(
                                  booking.status, booking.paymentStatus),
                              color: AppColors.brandNeutral600,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Service Date - Prominent Display
                  if (booking.scheduledDate != null ||
                      !(booking.paymentSegments != null &&
                          booking.paymentSegments!.isNotEmpty)) ...[
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        B3Medium(
                          text: 'SERVICE DATE',
                          color: AppColors.brandNeutral500,
                        ),
                        const SizedBox(height: 2),
                        B2Bold(
                          text: booking.scheduledDate != null &&
                                  booking.scheduledTime != null
                              ? _formatDateTime(booking.scheduledDate!,
                                  booking.scheduledTime!)
                              : 'To be scheduled after quote acceptance',
                          color: AppColors.brandNeutral800,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.md),
                  ],

                  // Key Details
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          B3Bold(
                            text: 'BOOKING ID: ',
                            color: AppColors.brandNeutral500,
                          ),
                          B3Medium(
                            text: booking.bookingReference,
                            color: AppColors.brandNeutral800,
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xs),

                      // Start/End times if available
                      if (booking.actualStartTime != null) ...[
                        Row(
                          children: [
                            const Icon(
                              Icons.play_circle_outline,
                              size: 16,
                              color: AppColors.brandNeutral600,
                            ),
                            const SizedBox(width: AppSpacing.xs),
                            B3Medium(
                              text:
                                  'Started at: ${_formatTimeOnly(booking.actualStartTime!)}',
                              color: AppColors.brandNeutral600,
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.xs),
                      ],

                      if (booking.actualEndTime != null) ...[
                        Row(
                          children: [
                            const Icon(
                              Icons.stop_circle_outlined,
                              size: 16,
                              color: AppColors.brandNeutral600,
                            ),
                            const SizedBox(width: AppSpacing.xs),
                            B3Medium(
                              text:
                                  'Completed at: ${_formatTimeOnly(booking.actualEndTime!)}',
                              color: AppColors.brandNeutral600,
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.xs),
                      ],

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
                              text:
                                  '${booking.address.name} • ${booking.address.address}, ${booking.address.city}',
                              color: AppColors.brandNeutral600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      if (booking.contactPerson.isNotEmpty ||
                          booking.contactPhone.isNotEmpty)
                        Row(
                          children: [
                            const Icon(
                              Icons.phone_outlined,
                              size: 16,
                              color: AppColors.brandNeutral600,
                            ),
                            const SizedBox(width: AppSpacing.xs),
                            B3Medium(
                              text:
                                  '${booking.contactPerson} • ${booking.contactPhone}',
                              color: AppColors.brandNeutral600,
                            ),
                          ],
                        ),

                      // Worker Assignment Display
                      if (booking.workerAssignment?.worker != null &&
                          !['rejected']
                              .contains(booking.workerAssignment!.status)) ...[
                        const SizedBox(height: AppSpacing.xs),
                        Row(
                          children: [
                            const Icon(
                              Icons.person_outline,
                              size: 16,
                              color: AppColors.brandNeutral600,
                            ),
                            const SizedBox(width: AppSpacing.xs),
                            Expanded(
                              child: Row(
                                children: [
                                  Flexible(
                                    child: B3Medium(
                                      text:
                                          'Worker: ${booking.workerAssignment!.worker!.name ?? 'Unknown'}',
                                      color: AppColors.brandNeutral600,
                                    ),
                                  ),
                                  if ([
                                    'assigned',
                                    'accepted',
                                    'in_progress'
                                  ].contains(
                                      booking.workerAssignment!.status)) ...[
                                    const SizedBox(width: AppSpacing.xs),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: AppSpacing.xs,
                                        vertical: 2,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.brandNeutral100,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: B4Regular(
                                        text: booking.workerAssignment!.status!
                                            .replaceAll('_', ' '),
                                        color: AppColors.brandNeutral600,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),

            // Bottom Side - Payment and Actions
            Container(
              width: double.maxFinite,
              decoration: const BoxDecoration(
                border: Border(
                  left: BorderSide(
                    color: AppColors.brandNeutral200,
                    width: 1,
                  ),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Payment Info
                    if (booking.payment?.amount != null ||
                        booking.quoteAmount != null) ...[
                      if (booking.payment?.amount != null &&
                          !_hasPaymentSegments(booking)) ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            B3Medium(
                              text: 'Total Amount',
                              color: AppColors.brandNeutral600,
                            ),
                            B3Medium(
                              text:
                                  '₹${booking.payment!.amount.toStringAsFixed(0)}',
                              color: AppColors.brandNeutral800,
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.xs),
                      ],
                      if (booking.quoteAmount != null) ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            B3Medium(
                              text: 'Quote Amount',
                              color: AppColors.brandNeutral600,
                            ),
                            B3Medium(
                              text:
                                  '₹${booking.quoteAmount!.toStringAsFixed(0)}',
                              color: AppColors.brandNeutral800,
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.xs),
                      ],
                      const SizedBox(height: AppSpacing.sm),
                    ],

                    // Action Buttons
                    ..._buildActionButtons(
                        context, bookingsState, bookingsNotifier),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _getStatusIcon(String status, String paymentStatus) {
    // Special case: pending status with completed payment
    if (status.toLowerCase() == 'pending' &&
        paymentStatus.toLowerCase() == 'completed') {
      return Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppColors.brandSecondary100,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(
          Icons.assignment_outlined,
          color: AppColors.brandSecondary600,
        ),
      );
    }

    switch (status.toLowerCase()) {
      case 'completed':
        return Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.stateGreen100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(
            Icons.check_circle_outline,
            color: AppColors.stateGreen600,
          ),
        );
      case 'confirmed':
      case 'scheduled':
        final hasWorkerAssignment =
            booking.workerAssignment?.worker?.name != null;

        // If there's a worker assignment and accepted, show worker assigned icon
        if (hasWorkerAssignment &&
            booking.workerAssignment?.status == "accepted") {
          return Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.accentTeal100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.person_outline,
              color: AppColors.accentTeal600,
            ),
          );
        }

        return Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.accentTeal100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(
            Icons.schedule,
            color: AppColors.accentTeal600,
          ),
        );
      case 'assigned':
        return Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.accentTeal100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(
            Icons.person_outline,
            color: AppColors.accentTeal600,
          ),
        );
      case 'in_progress':
        final hasStarted = booking.actualStartTime != null;
        return Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: hasStarted
                ? AppColors.brandNeutral200
                : AppColors.accentTeal100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            hasStarted ? Icons.work_outline : Icons.person_outline,
            color: hasStarted
                ? AppColors.brandNeutral600
                : AppColors.accentTeal600,
          ),
        );
      case 'quote_accepted':
        return Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.stateGreen100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(
            Icons.thumb_up_outlined,
            color: AppColors.stateGreen600,
          ),
        );
      case 'pending':
      case 'quote_provided':
        return Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.brandSecondary100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(
            Icons.info_outline,
            color: AppColors.brandSecondary600,
          ),
        );
      case 'temporary_hold':
        return Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.brandSecondary100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(
            Icons.pause_circle_outline,
            color: AppColors.brandSecondary600,
          ),
        );
      case 'cancelled':
      case 'rejected':
        return Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.stateRed100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(
            Icons.cancel_outlined,
            color: AppColors.stateRed600,
          ),
        );
      default:
        return Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.brandNeutral200,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(
            Icons.assignment_outlined,
            color: AppColors.brandNeutral600,
          ),
        );
    }
  }

  String _getStatusSubtitle(String status, String paymentStatus) {
    // Special case: pending status with completed payment
    if (status.toLowerCase() == 'pending' &&
        paymentStatus.toLowerCase() == 'completed') {
      return 'Our team will review your request and provide a quote shortly';
    }

    switch (status.toLowerCase()) {
      case 'completed':
        return 'Service has been completed successfully';
      case 'confirmed':
      case 'scheduled':
        final workerRejected = booking.workerAssignment?.status == "rejected";
        final hasWorkerAssignment =
            booking.workerAssignment?.worker?.name != null;

        // If there's a worker assignment and accepted, show worker assigned status
        if (hasWorkerAssignment &&
            booking.workerAssignment?.status == "accepted") {
          return 'Your service professional is on the way';
        }

        return workerRejected
            ? 'A new professional will be assigned to this booking soon'
            : 'A professional will be assigned to this booking soon';
      case 'assigned':
        final workerName = booking.workerAssignment?.worker?.name;
        return workerName != null
            ? 'Your service professional is on the way'
            : 'Your service professional is on the way';
      case 'in_progress':
        final hasStarted = booking.actualStartTime != null;
        return hasStarted
            ? 'Your service is currently being performed'
            : 'Your service professional has arrived and is ready to start';
      case 'quote_accepted':
        return 'Please complete the payment to proceed with the booking';
      case 'pending':
      case 'quote_provided':
        return 'Please review and accept the quote';
      case 'temporary_hold':
        return 'Your payment is being verified. This may take a few minutes.';
      case 'cancelled':
      case 'rejected':
        return 'This booking has been cancelled';
      default:
        return 'Your booking is being processed';
    }
  }

  String _formatTimeOnly(DateTime time) {
    DateTime indianTime;

    if (time.isUtc) {
      // Convert UTC to IST (UTC+5:30)
      indianTime = time.add(const Duration(hours: 5, minutes: 30));
    } else {
      // Assume it's already in IST
      indianTime = time;
    }

    final timeFormat = DateFormat('hh:mm a');
    return timeFormat.format(indianTime);
  }

  bool _hasPaymentSegments(BookingDetailsEntity booking) {
    return booking.paymentSegments != null &&
        booking.paymentSegments!.isNotEmpty;
  }

  bool _hasPendingSegments(BookingDetailsEntity booking) {
    return booking.paymentSegments != null &&
        booking.paymentSegments!.any((segment) =>
            segment.status == 'pending' || segment.status == 'overdue');
  }

  bool _isSingleSegmentBooking(BookingDetailsEntity booking) {
    return booking.paymentSegments != null &&
        booking.paymentSegments!.length == 1;
  }

  bool _isFirstSegment(BookingDetailsEntity booking) {
    return booking.paymentProgress != null &&
        booking.paymentProgress!.paidSegments == 0 &&
        _hasPendingSegments(booking) &&
        booking.status == 'quote_accepted' &&
        !_isSingleSegmentBooking(booking);
  }

  bool _isNextSegment(BookingDetailsEntity booking) {
    return booking.paymentProgress != null &&
        booking.paymentProgress!.paidSegments > 0 &&
        _hasPendingSegments(booking) &&
        (booking.status == "quote_accepted" ||
            booking.status == "partially_paid" ||
            booking.status == "confirmed");
  }

  List<Widget> _buildActionButtons(BuildContext context,
      BookingsState bookingsState, BookingsNotifier bookingsNotifier) {
    final status = booking.status.toLowerCase();

    List<Widget> buttons = [];

    // Quote provided - show accept/reject buttons
    if (status == 'quote_provided') {
      buttons.addAll([
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: bookingsState.isAcceptingQuote
                ? null
                : () async {
                    if (context.mounted) {
                      try {
                        await bookingsNotifier.acceptQuote(
                          bookingId: booking.id,
                        );
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SuccessSnackbarWidget(
                              message: 'Quote accepted successfully',
                            ).createSnackBar(),
                          );
                        }
                        if (context.mounted) {
                          QuoteAcceptanceBottomSheet.show(context, booking);
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            ErrorSnackbarWidget(
                                    message:
                                        'Failed to accept quote: ${e.toString()}')
                                .createSnackBar(),
                          );
                        }
                      }
                    }
                  },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.brandPrimary600,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(bookingsState.isAcceptingQuote
                ? 'Accepting...'
                : 'Accept Quote'),
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: bookingsState.isRejectingQuote
                ? null
                : () async {
                    if (context.mounted) {
                      try {
                        await bookingsNotifier.rejectQuote(
                          bookingId: booking.id,
                        );
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SuccessSnackbarWidget(
                              message: 'Quote rejected successfully',
                            ).createSnackBar(),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            ErrorSnackbarWidget(
                                    message:
                                        'Failed to reject quote: ${e.toString()}')
                                .createSnackBar(),
                          );
                        }
                      }
                    }
                  },
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.stateRed600),
              foregroundColor: AppColors.stateRed600,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(bookingsState.isRejectingQuote
                ? 'Rejecting...'
                : 'Reject Quote'),
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
      ]);
    }

    // Quote accepted - show pay now button
    if (status == 'quote_accepted' &&
        (_isSingleSegmentBooking(booking) || !_hasPaymentSegments(booking))) {
      buttons.addAll([
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => QuoteAcceptanceBottomSheet.show(context, booking),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.stateGreen600,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Pay Now'),
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
      ]);
    }

    if (_isFirstSegment(booking)) {
      buttons.addAll([
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {
              // _showPaymentSegmentsBottomSheet(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.stateGreen600,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.credit_card, size: 16),
                SizedBox(width: AppSpacing.xs),
                Text('Pay First Segment'),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
      ]);
    }

    if (_isNextSegment(booking)) {
      buttons.addAll([
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {
              // _showPaymentSegmentsBottomSheet(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.stateRed600,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.credit_card, size: 16),
                SizedBox(width: AppSpacing.xs),
                Text('Pay Next Segment'),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
      ]);
    }

    if (_hasPaymentSegments(booking) &&
        (booking.status == "quote_provided" ||
            booking.status == "quote_accepted" ||
            booking.status == "partially_paid" ||
            booking.status == "confirmed")) {
      buttons.addAll([
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: () {
              _showPaymentSegmentsBottomSheet(context);
            },
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppColors.brandPrimary600),
              foregroundColor: AppColors.brandPrimary600,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.credit_card, size: 16),
                SizedBox(width: AppSpacing.xs),
                Text('View Segments'),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
      ]);
    }

    // Temporary hold - show status message
    if (status == 'temporary_hold') {
      return [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            color: AppColors.brandSecondary50,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.brandSecondary200),
          ),
          child: Column(
            children: [
              B3Medium(
                text: 'Payment verification in progress...',
                color: AppColors.brandSecondary600,
              ),
              const SizedBox(height: 4),
              B4Regular(
                text: 'This may take a few minutes',
                color: AppColors.brandNeutral500,
              ),
            ],
          ),
        ),
      ];
    }

    // Cancelled/Rejected - no longer show status message
    if (['cancelled', 'rejected'].contains(status)) {
      return [];
    }

    // Add Track Worker Location button for in_progress bookings
    if (status == 'in_progress' &&
        booking.workerAssignment?.status == 'in_progress') {
      buttons.add(
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {
              _showLocationTrackingModal(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.brandPrimary600,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.location_on, size: 16),
                SizedBox(width: AppSpacing.xs),
                Text('Track Worker Location'),
              ],
            ),
          ),
        ),
      );
      buttons.add(const SizedBox(height: AppSpacing.xs));
    }

    if (booking.workerAssignment?.worker != null &&
        ["accepted", "in_progress"]
            .contains(booking.workerAssignment!.status)) {
      buttons.add(
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(
              onPressed: () {},
              icon: const Icon(Icons.phone_outlined),
              color: AppColors.brandNeutral600,
            ),
            const SizedBox(width: AppSpacing.xs),
            IconButton(
              onPressed: () {},
              icon: const Icon(Icons.message_outlined),
              color: AppColors.brandNeutral600,
            ),
          ],
        ),
      );
    }

    // Add cancel button for cancellable statuses
    if ([
      'pending',
      'confirmed',
      'scheduled',
      'quote_provided',
      'quote_accepted'
    ].contains(status)) {
      if (!(["accepted", "in_progress"].contains(
          booking.workerAssignment != null &&
                  booking.workerAssignment!.status != null
              ? booking.workerAssignment!.status
              : ""))) {
        buttons.add(
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
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
                              const SuccessSnackbarWidget(
                                message: 'Booking cancelled successfully',
                              ).createSnackBar(),
                            );
                          }
                        } catch (e) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              ErrorSnackbarWidget(
                                      message:
                                          'Failed to cancel booking: ${e.toString()}')
                                  .createSnackBar(),
                            );
                          }
                        }
                      }
                    },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.stateRed600),
                foregroundColor: AppColors.stateRed600,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(bookingsState.isCancelling
                  ? 'Cancelling...'
                  : 'Cancel Booking'),
            ),
          ),
        );
      }
    }

    return buttons;
  }

  void _showLocationTrackingModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => LocationTrackingModal(booking: booking),
    );
  }

  void _showPaymentSegmentsBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PaymentSegmentsBottomSheet(booking: booking),
    );
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
