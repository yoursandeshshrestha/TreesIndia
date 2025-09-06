import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

import '../../../domain/entities/assignment_entity.dart';
import '../../providers/my_works_providers.dart';

class AssignmentCardWidget extends ConsumerWidget {
  final AssignmentEntity assignment;

  const AssignmentCardWidget({
    super.key,
    required this.assignment,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.brandNeutral100,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
                AppSpacing.md, AppSpacing.md, AppSpacing.md, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header with service name and status chip
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          H4Bold(
                            text: assignment.booking.service.name,
                            color: AppColors.brandNeutral800,
                          ),
                          const SizedBox(height: 4),
                          B3Medium(
                              text: _getStatusMessage(assignment.status),
                              color: AppColors.brandNeutral600),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    _buildStatusChip(assignment.status),
                  ],
                ),

                const SizedBox(height: AppSpacing.md),

                // Service date
                if (assignment.booking.scheduledDate != null) ...[
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      B3Medium(
                        text: 'SERVICE DATE',
                        color: AppColors.brandNeutral500,
                      ),
                      const SizedBox(height: 2),
                      B2Bold(
                        text: assignment.booking.scheduledDate != null &&
                                assignment.booking.scheduledTime != null
                            ? _formatDateTime(assignment.booking.scheduledDate!,
                                assignment.booking.scheduledTime!)
                            : 'To be scheduled after quote acceptance',
                        color: AppColors.brandNeutral800,
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: AppSpacing.md),
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
                          text: assignment.booking.bookingReference,
                          color: AppColors.brandNeutral800,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xs),

                    // Start/End times if available
                    if (assignment.booking.actualStartTime != null) ...[
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
                                'Started at: ${_formatTimeOnly(assignment.booking.actualStartTime!)}',
                            color: AppColors.brandNeutral600,
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xs),
                    ],

                    if (assignment.booking.actualEndTime != null) ...[
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
                                'Completed at: ${_formatTimeOnly(assignment.booking.actualEndTime!)}',
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
                                '${assignment.booking.address.address}, ${assignment.booking.address.city}',
                            color: AppColors.brandNeutral600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    if (assignment.booking.contactPerson.isNotEmpty)
                      Row(
                        children: [
                          const Icon(
                            Icons.person_outline,
                            size: 16,
                            color: AppColors.brandNeutral600,
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          B3Medium(
                            text:
                                "Customer: ${assignment.booking.contactPerson.isNotEmpty ? assignment.booking.contactPerson : 'N/A'}",
                            color: AppColors.brandNeutral600,
                          ),
                        ],
                      ),
                    const SizedBox(height: AppSpacing.xs),
                    if (assignment.booking.quoteAmount != null)
                      Row(
                        children: [
                          B3Medium(
                            text: "Amount:",
                            color: AppColors.brandNeutral400,
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          B3Medium(
                            text:
                                "₹${assignment.booking.quoteAmount!.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}",
                            color: AppColors.brandNeutral600,
                          ),
                        ],
                      ),
                    const SizedBox(height: AppSpacing.xs),
                    if (assignment.assignmentNotes.isNotEmpty)
                      Row(
                        children: [
                          B3Medium(
                            text: "Notes:",
                            color: AppColors.brandNeutral400,
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          B3Medium(
                            text: assignment.assignmentNotes,
                            color: AppColors.brandNeutral600,
                          ),
                        ],
                      ),
                    const SizedBox(height: AppSpacing.xs),
                    Row(
                      children: [
                        B3Medium(
                          text: "ASSIGNED BY:",
                          color: AppColors.brandNeutral400,
                        ),
                        const SizedBox(width: AppSpacing.xs),
                        B3Medium(
                          text: (assignment.assignedByUser.name?.isNotEmpty ??
                                  false
                              ? assignment.assignedByUser.name!
                              : 'Admin'),
                          color: AppColors.brandNeutral600,
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Bottom Side - Action buttons and quick actions
          SizedBox(
            width: double.maxFinite,
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Row(
                children: [
                  Expanded(
                      child: _buildActionButtons(context, ref, assignment)),
                  if (_shouldShowQuickActions(assignment.status)) ...[
                    const SizedBox(width: 16),
                    _buildQuickActions(),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getStatusMessage(String status) {
    switch (status.toLowerCase()) {
      case 'assigned':
        return 'Please accept or reject this assignment';
      case 'accepted':
        return 'Ready to start work';
      case 'in_progress':
        return 'Work is currently in progress';
      case 'completed':
        return 'Work has been completed';
      case 'rejected':
        return 'Work has been rejected';
      default:
        return 'Assignment status unknown';
    }
  }

  Widget _buildStatusChip(String status) {
    Color backgroundColor;
    Color textColor;
    String displayText;

    switch (status.toLowerCase()) {
      case 'assigned':
        backgroundColor = const Color(0xFFE3F2FD);
        textColor = const Color(0xFF1976D2);
        displayText = 'Assigned';
        break;
      case 'accepted':
        backgroundColor = const Color(0xFFE8F5E8);
        textColor = AppColors.stateGreen600;
        displayText = 'Accepted';
        break;
      case 'in_progress':
        backgroundColor = const Color(0xFFFFF3E0);
        textColor = const Color(0xFFFF9800);
        displayText = 'In Progress';
        break;
      case 'completed':
        backgroundColor = const Color(0xFFE8F5E8);
        textColor = AppColors.stateGreen600;
        displayText = 'Completed';
        break;
      case 'rejected':
        backgroundColor = const Color(0xFFF5F5F5);
        textColor = const Color(0xFF757575);
        displayText = 'Rejected';
        break;
      default:
        backgroundColor = const Color(0xFFF5F5F5);
        textColor = const Color(0xFF757575);
        displayText = 'Unknown';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        displayText,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
    );
  }

  bool _shouldShowQuickActions(String status) {
    return status.toLowerCase() == 'assigned' ||
        status.toLowerCase() == 'accepted' ||
        status.toLowerCase() == 'in_progress';
  }

  Widget _buildQuickActions() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        B3Medium(
          text: 'Quick Actions',
          color: AppColors.brandNeutral500,
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: const BoxDecoration(
                color: Color(0xFFF5F5F5),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.chat_bubble_outline,
                size: 24,
                color: Colors.grey,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              width: 48,
              height: 48,
              decoration: const BoxDecoration(
                color: Color(0xFFF5F5F5),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.phone_outlined,
                size: 24,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionButtons(
      BuildContext context, WidgetRef ref, AssignmentEntity assignment) {
    final myWorksState = ref.watch(myWorksNotifierProvider);

    switch (assignment.status.toLowerCase()) {
      case 'assigned':
        return Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: myWorksState.isAccepting
                    ? null
                    : () => ref
                        .read(myWorksNotifierProvider.notifier)
                        .acceptAssignment(assignment.id),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.stateGreen600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: myWorksState.isAccepting
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Accept',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: myWorksState.isRejecting
                    ? null
                    : () => _showRejectDialog(context, ref, assignment.id),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.stateRed600,
                  side: const BorderSide(color: AppColors.stateRed600),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: myWorksState.isRejecting
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppColors.stateRed600,
                        ),
                      )
                    : const Text(
                        'Decline',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
              ),
            ),
          ],
        );

      case 'accepted':
        return Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: myWorksState.isStarting
                    ? null
                    : () => ref
                        .read(myWorksNotifierProvider.notifier)
                        .startWork(assignment.id),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.stateGreen600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: myWorksState.isStarting
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Start Work',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
              ),
            ),
          ],
        );

      case 'in_progress':
        return Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: myWorksState.isCompleting
                    ? null
                    : () => ref
                        .read(myWorksNotifierProvider.notifier)
                        .completeWork(assignment.id),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.stateGreen600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: myWorksState.isCompleting
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Complete',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  // Handle start tracking functionality
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.brandPrimary600,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.play_arrow, size: 16),
                    SizedBox(width: 4),
                    Text(
                      'Start Tracking',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );

      case 'completed':
        return SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: () {
              // Handle view details functionality
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.grey[600],
              side: BorderSide(color: Colors.grey[300]!),
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              'View Details',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
          ),
        );

      default:
        return const SizedBox.shrink();
    }
  }

  void _showRejectDialog(
      BuildContext context, WidgetRef ref, int assignmentId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reject Assignment'),
        content: const Text('Are you sure you want to reject this assignment?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              ref.read(myWorksNotifierProvider.notifier).rejectAssignment(
                  assignmentId, 'Worker rejected the assignment');
            },
            child: const Text('Reject'),
          ),
        ],
      ),
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
}
