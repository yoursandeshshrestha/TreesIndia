import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../../../commons/utils/date_utils.dart';
import '../../../../../commons/utils/utils.dart';
import '../../../domain/entities/booking_details_entity.dart';
import '../../providers/bookings_providers.dart';

class BookingDetailsBottomSheet extends ConsumerWidget {
  final BookingDetailsEntity booking;

  const BookingDetailsBottomSheet({
    super.key,
    required this.booking,
  });

  static void show(BuildContext context, BookingDetailsEntity booking) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => BookingDetailsBottomSheet(booking: booking),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsNotifier = ref.read(bookingsNotifierProvider.notifier);
    final bookingsState = ref.watch(bookingsNotifierProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
            ),
          ),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(top: AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.brandNeutral300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(),
                      const SizedBox(height: AppSpacing.lg),
                      _buildServiceSection(),
                      const SizedBox(height: AppSpacing.lg),
                      _buildScheduleSection(),
                      const SizedBox(height: AppSpacing.lg),
                      _buildAddressSection(),
                      const SizedBox(height: AppSpacing.lg),
                      _buildContactSection(),
                      if (booking.workerAssignment != null) ...[
                        const SizedBox(height: AppSpacing.lg),
                        _buildWorkerAssignmentSection(),
                      ],
                      const SizedBox(height: AppSpacing.lg),
                      _buildBookingDetailsSection(),
                      if (booking.payment != null) ...[
                        const SizedBox(height: AppSpacing.lg),
                        _buildPaymentSection(),
                      ],
                      if (booking.quoteAmount != null) ...[
                        const SizedBox(height: AppSpacing.lg),
                        _buildQuoteSection(),
                      ],
                      if (booking.actualStartTime != null ||
                          booking.actualEndTime != null) ...[
                        const SizedBox(height: AppSpacing.lg),
                        _buildActualTimingSection(),
                      ],
                      const SizedBox(height: AppSpacing.xl),
                      // if (booking.status.toLowerCase() != 'cancelled' &&
                      //     booking.status.toLowerCase() != 'assigned') ...[
                      //   _buildCancelButton(
                      //       context, bookingsNotifier, bookingsState),
                      //   const SizedBox(height: AppSpacing.lg),
                      // ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: H3Bold(
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
            B2Medium(
              text: booking.bookingReference,
              color: AppColors.brandNeutral600,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildServiceSection() {
    return _buildSection(
      title: 'Service Details',
      children: [
        _buildDetailRow('Service', booking.service.name),
        _buildDetailRow('Description', booking.service.description),
        if (booking.service.price != null)
          _buildDetailRow('Price', '₹${booking.service.price}'),
        if (booking.service.duration != null)
          _buildDetailRow('Duration', booking.service.duration!),
        _buildDetailRow(
            'Price Type', _formatPriceType(booking.service.priceType)),
        if (booking.description.isNotEmpty)
          _buildDetailRow('Special Requirements', booking.description),
        if (booking.specialInstructions.isNotEmpty)
          _buildDetailRow('Special Instructions', booking.specialInstructions),
      ],
    );
  }

  Widget _buildScheduleSection() {
    return _buildSection(
      title: 'Schedule',
      children: [
        if (booking.scheduledDate != null)
          _buildDetailRow('Date', _formatDate(booking.scheduledDate!)),
        if (booking.scheduledTime != null)
          _buildDetailRow('Start Time', _formatTime(booking.scheduledTime!)),
        if (booking.scheduledEndTime != null)
          _buildDetailRow('End Time', _formatTime(booking.scheduledEndTime!)),
        if (booking.scheduledDate != null &&
            booking.scheduledTime != null &&
            booking.scheduledEndTime != null)
          _buildDetailRow('Duration', _calculateDuration()),
        if (booking.scheduledDate == null || booking.scheduledTime == null)
          _buildDetailRow('Status', 'Schedule to be confirmed'),
      ],
    );
  }

  Widget _buildAddressSection() {
    return _buildSection(
      title: 'Service Address',
      children: [
        _buildDetailRow('Name', booking.address.name),
        _buildDetailRow('Address', booking.address.address),
        if (booking.address.landmark.isNotEmpty)
          _buildDetailRow('Landmark', booking.address.landmark),
        _buildDetailRow(
            'City', '${booking.address.city}, ${booking.address.state}'),
        _buildDetailRow('Postal Code', booking.address.postalCode),
        if (booking.address.houseNumber.isNotEmpty)
          _buildDetailRow('House Number', booking.address.houseNumber),
      ],
    );
  }

  Widget _buildContactSection() {
    return _buildSection(
      title: 'Contact Information',
      children: [
        _buildDetailRow(
            'Contact Person',
            booking.contactPerson.isEmpty
                ? 'Not Provided'
                : booking.contactPerson),
        _buildDetailRow(
            'Phone Number',
            booking.contactPhone.isEmpty
                ? 'Not Provided'
                : booking.contactPhone),
      ],
    );
  }

  Widget _buildWorkerAssignmentSection() {
    if (booking.workerAssignment == null) {
      return const SizedBox.shrink();
    }

    final assignment = booking.workerAssignment!;
    List<Widget> children = [];

    // Worker Information
    if (assignment.worker != null) {
      children.addAll([
        _buildDetailRow(
            'Worker Name', assignment.worker!.name ?? 'Not Provided'),
        _buildDetailRow(
            'Worker Phone', assignment.worker!.phone ?? 'Not available'),
        _buildDetailRow('Worker Type', assignment.worker!.userType ?? 'Worker'),
      ]);
    }

    // Assignment Status and Details
    children.addAll([
      _buildDetailRow(
          'Assignment Status', _formatAssignmentStatus(assignment.status)),
      _buildDetailRow('Assigned At', _formatDateTime(assignment.assignedAt)),
    ]);

    // Status-specific timestamps
    if (assignment.acceptedAt != null) {
      children.add(_buildDetailRow(
          'Accepted At', _formatDateTime(assignment.acceptedAt!)));
    }
    if (assignment.rejectedAt != null) {
      children.add(_buildDetailRow(
          'Rejected At', _formatDateTime(assignment.rejectedAt!)));
    }
    if (assignment.startedAt != null) {
      children.add(_buildDetailRow(
          'Started At', _formatDateTime(assignment.startedAt!)));
    }
    if (assignment.completedAt != null) {
      children.add(_buildDetailRow(
          'Completed At', _formatDateTime(assignment.completedAt!)));
    }

    // Assignment Notes
    if (assignment.assignmentNotes != null &&
        assignment.assignmentNotes!.isNotEmpty) {
      children.add(
          _buildDetailRow('Assignment Notes', assignment.assignmentNotes!));
    }
    if (assignment.acceptanceNotes != null &&
        assignment.acceptanceNotes!.isNotEmpty) {
      children.add(
          _buildDetailRow('Acceptance Notes', assignment.acceptanceNotes!));
    }
    if (assignment.rejectionNotes != null &&
        assignment.rejectionNotes!.isNotEmpty) {
      children
          .add(_buildDetailRow('Rejection Notes', assignment.rejectionNotes!));
    }
    if (assignment.rejectionReason != null &&
        assignment.rejectionReason!.isNotEmpty) {
      children.add(
          _buildDetailRow('Rejection Reason', assignment.rejectionReason!));
    }

    // Assigned by information
    if (assignment.assignedByUser != null) {
      children.add(_buildDetailRow(
          'Assigned By', assignment.assignedByUser!.name ?? 'Unknown'));
    }

    return _buildSection(
      title: 'Worker Assignment',
      children: children,
    );
  }

  Widget _buildBookingDetailsSection() {
    return _buildSection(
      title: 'Booking Information',
      children: [
        _buildDetailRow(
            'Booking Type', _formatBookingType(booking.bookingType)),
        _buildDetailRow('Status', _formatStatus(booking.status)),
        _buildDetailRow(
            'Payment Status', _formatPaymentStatus(booking.paymentStatus)),
        _buildDetailRow('Created On', _formatDateTime(booking.createdAt)),
        _buildDetailRow('Last Updated', _formatDateTime(booking.updatedAt)),
        if (booking.completionType != null)
          _buildDetailRow('Completion Type', booking.completionType!),
        if (booking.holdExpiresAt != null)
          _buildDetailRow(
              'Hold Expires At', _formatDateTime(booking.holdExpiresAt!)),
      ],
    );
  }

  Widget _buildPaymentSection() {
    if (booking.payment == null) return const SizedBox.shrink();

    final payment = booking.payment!;
    return _buildSection(
      title: 'Payment Details',
      children: [
        _buildDetailRow('Payment Reference', payment.paymentReference),
        _buildDetailRow('Amount', '${payment.currency} ${payment.amount}'),
        _buildDetailRow('Method', _formatPaymentMethod(payment.method)),
        _buildDetailRow('Status', _formatPaymentStatus(payment.status)),
        if (payment.description.isNotEmpty)
          _buildDetailRow('Description', payment.description),
        if (payment.notes.isNotEmpty) _buildDetailRow('Notes', payment.notes),
        if (payment.initiatedAt != null)
          _buildDetailRow(
              'Initiated At', _formatDateTime(payment.initiatedAt!)),
        if (payment.completedAt != null)
          _buildDetailRow(
              'Completed At', _formatDateTime(payment.completedAt!)),
        if (payment.razorpayPaymentId != null)
          _buildDetailRow('Razorpay Payment ID', payment.razorpayPaymentId!),
      ],
    );
  }

  Widget _buildQuoteSection() {
    return _buildSection(
      title: 'Quote Information',
      children: [
        if (booking.quoteAmount != null)
          _buildDetailRow('Quote Amount', '₹${booking.quoteAmount}'),
        if (booking.quoteNotes.isNotEmpty)
          _buildDetailRow('Quote Notes', booking.quoteNotes),
        if (booking.quoteProvidedBy != null)
          _buildDetailRow('Quote Provided By', booking.quoteProvidedBy!),
        if (booking.quoteProvidedAt != null)
          _buildDetailRow(
              'Quote Provided At', _formatDateTime(booking.quoteProvidedAt!)),
        if (booking.quoteAcceptedAt != null)
          _buildDetailRow(
              'Quote Accepted At', _formatDateTime(booking.quoteAcceptedAt!)),
        if (booking.quoteExpiresAt != null)
          _buildDetailRow(
              'Quote Expires At', _formatDateTime(booking.quoteExpiresAt!)),
      ],
    );
  }

  Widget _buildActualTimingSection() {
    return _buildSection(
      title: 'Actual Service Timing',
      children: [
        if (booking.actualStartTime != null)
          _buildDetailRow(
              'Actual Start Time', _formatDateTime(booking.actualStartTime!)),
        if (booking.actualEndTime != null)
          _buildDetailRow(
              'Actual End Time', _formatDateTime(booking.actualEndTime!)),
        if (booking.actualDurationMinutes != null)
          _buildDetailRow('Actual Duration',
              Utils.formatDurationFromMinutes(booking.actualDurationMinutes!)),
      ],
    );
  }

  Widget _buildSection({
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H4Bold(
          text: title,
          color: AppColors.brandNeutral800,
        ),
        const SizedBox(height: AppSpacing.md),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.brandNeutral50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppColors.brandNeutral200,
              width: 1,
            ),
          ),
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: B3Regular(
              text: label,
              color: AppColors.brandNeutral600,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: B3Medium(
              text: value,
              color: AppColors.brandNeutral800,
            ),
          ),
        ],
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

  String _formatBookingType(String type) {
    return type[0].toUpperCase() + type.substring(1);
  }

  String _formatPriceType(String type) {
    return type[0].toUpperCase() + type.substring(1);
  }

  String _formatPaymentMethod(String method) {
    return method[0].toUpperCase() + method.substring(1);
  }

  String _formatAssignmentStatus(String? status) {
    if (status == null) return 'Unknown';
    switch (status.toLowerCase()) {
      case 'assigned':
        return 'Assigned';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status
            .split('_')
            .map((word) => word[0].toUpperCase() + word.substring(1))
            .join(' ');
    }
  }

  String _formatDate(DateTime date) {
    return DateFormat('EEEE, MMM dd, yyyy').format(date);
  }

  String _formatTime(DateTime time) {
    // Convert to IST using utility function
    final indianTime = ISTDateUtils.convertToISTFromDateTime(time);

    return DateFormat('hh:mm a').format(indianTime);
  }

  String _formatDateTime(DateTime? dateTime) {
    if (dateTime == null) return 'Unknown';

    // Convert to IST using utility function
    final indianTime = ISTDateUtils.convertToISTFromDateTime(dateTime);

    return DateFormat('MMM dd, yyyy at hh:mm a').format(indianTime);
  }

  String _calculateDuration() {
    if (booking.scheduledEndTime == null || booking.scheduledTime == null) {
      return 'Not specified';
    }

    final duration =
        booking.scheduledEndTime!.difference(booking.scheduledTime!);
    final hours = duration.inHours;
    final minutes = duration.inMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return '${hours}h ${minutes}m';
    } else if (hours > 0) {
      return '${hours}h';
    } else {
      return '${minutes}m';
    }
  }

  // Widget _buildCancelButton(BuildContext context,
  //     BookingsNotifier bookingsNotifier, BookingsState bookingsState) {
  //   return SizedBox(
  //     width: double.infinity,
  //     child: ElevatedButton(
  //       onPressed: bookingsState.isCancelling
  //           ? null
  //           : () async {
  //               final result = await CancelBookingBottomSheet.show(
  //                 context,
  //                 booking.bookingReference,
  //               );

  //               if (result != null && context.mounted) {
  //                 try {
  //                   await bookingsNotifier.cancelBooking(
  //                     bookingId: booking.id,
  //                     reason: result['reason']!,
  //                     cancellationReason: result['cancellation_reason']!.isEmpty
  //                         ? null
  //                         : result['cancellation_reason'],
  //                   );
  //                   if (context.mounted) {
  //                     Navigator.of(context).pop(); // Close the bottom sheet
  //                     ScaffoldMessenger.of(context).showSnackBar(
  //                       const SnackBar(
  //                         content: Text('Booking cancelled successfully'),
  //                         backgroundColor: Colors.green,
  //                       ),
  //                     );
  //                   }
  //                 } catch (e) {
  //                   if (context.mounted) {
  //                     ScaffoldMessenger.of(context).showSnackBar(
  //                       SnackBar(
  //                         content:
  //                             Text('Failed to cancel booking: ${e.toString()}'),
  //                         backgroundColor: Colors.red,
  //                       ),
  //                     );
  //                   }
  //                 }
  //               }
  //             },
  //       style: ElevatedButton.styleFrom(
  //         backgroundColor: AppColors.stateRed600,
  //         foregroundColor: AppColors.white,
  //         padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
  //         shape: RoundedRectangleBorder(
  //           borderRadius: BorderRadius.circular(12),
  //         ),
  //       ),
  //       child: B2Bold(
  //         text: 'Cancel Booking',
  //         color: AppColors.white,
  //       ),
  //     ),
  //   );
  // }
}
