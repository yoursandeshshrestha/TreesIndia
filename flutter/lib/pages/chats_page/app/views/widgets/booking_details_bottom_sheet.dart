import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import '../../../domain/entities/chat_room_entity.dart';

class BookingDetailsBottomSheet extends StatelessWidget {
  final ChatRoomEntity chatRoom;

  const BookingDetailsBottomSheet({
    super.key,
    required this.chatRoom,
  });

  @override
  Widget build(BuildContext context) {
    final booking = chatRoom.booking;
    if (booking == null) {
      return const SizedBox.shrink();
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              B2Bold(
                text: 'Booking Details',
                color: Colors.black87,
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: H3Bold(text: booking.service.name),
          ),
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                H4Bold(
                  text: booking.service.categoryName,
                  color: AppColors.brandNeutral600,
                ),
                const SizedBox(width: 4),
                H4Medium(text: "-"),
                const SizedBox(width: 4),
                H4Medium(
                  text: booking.service.subcategoryName,
                  color: AppColors.brandNeutral600,
                ),
              ],
            ),
          ),
          _buildDetailItem('Booking Reference', booking.bookingReference),
          _buildDetailItem('Status', _formatStatus(booking.status)),
          _buildDetailItem(
              'Booking Type', _formatBookingType(booking.bookingType)),
          if (booking.scheduledDate != null)
            _buildDetailItem(
                'Scheduled Date', _formatDate(booking.scheduledDate!)),
          if (booking.scheduledTime != null)
            _buildDetailItem(
                'Scheduled Time', _formatTime(booking.scheduledTime!)),
          if (booking.workerAssignment?.worker?.name != null)
            _buildDetailItem(
                'Worker', booking.workerAssignment!.worker!.name ?? 'Unknown'),
          if (booking.workerAssignment?.startedAt != null)
            _buildDetailItem('Started At',
                _formatDateTime(booking.workerAssignment!.startedAt!)),
          if (booking.workerAssignment?.completedAt != null)
            _buildDetailItem('Completed At',
                _formatDateTime(booking.workerAssignment!.completedAt!)),
          _buildAddressSection(booking),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildDetailItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 150,
            child: B3Medium(
              text: '$label:',
              color: AppColors.brandNeutral500,
            ),
          ),
          Expanded(
            child: B3Bold(
              text: value,
              color: AppColors.brandNeutral800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddressSection(booking) {
    final address = booking.address;
    final fullAddress = [
      if (address.houseNumber?.isNotEmpty == true) address.houseNumber,
      if (address.address?.isNotEmpty == true) address.address,
      if (address.landmark?.isNotEmpty == true) address.landmark,
      if (address.city?.isNotEmpty == true) address.city,
      if (address.state?.isNotEmpty == true) address.state,
      if (address.postalCode?.isNotEmpty == true) address.postalCode,
    ].where((element) => element != null && element.isNotEmpty).join(', ');

    if (fullAddress.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 8),
        B3Medium(
          text: 'Booking Address:',
          color: AppColors.brandNeutral500,
        ),
        const SizedBox(height: 4),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey[300]!),
          ),
          child: B3Regular(
            text: fullAddress,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }

  String _formatStatus(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.toUpperCase();
    }
  }

  String _formatBookingType(String bookingType) {
    switch (bookingType.toLowerCase()) {
      case 'inquiry':
        return 'Inquiry';
      case 'regular':
        return 'Regular';
      default:
        return bookingType.toUpperCase();
    }
  }

  String _formatDate(DateTime dateTime) {
    return DateFormat('dd MMM yyyy').format(dateTime.toLocal());
  }

  String _formatTime(DateTime dateTime) {
    return DateFormat('hh:mm a').format(dateTime.toLocal());
  }

  String _formatDateTime(DateTime dateTime) {
    return DateFormat('dd MMM yyyy, hh:mm a').format(dateTime.toLocal());
  }
}
