import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'application_status_badge.dart';
import '../../../domain/entities/worker_application_entity.dart';

class WorkerApplicationStatusWidget extends StatelessWidget {
  final WorkerApplicationEntity application;

  const WorkerApplicationStatusWidget({
    super.key,
    required this.application,
  });

  @override
  Widget build(BuildContext context) {
    final status = ApplicationStatusBadge.fromString(application.status ?? 'pending');

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Success/Status Icon
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: _getIconBackgroundColor(status),
              shape: BoxShape.circle,
            ),
            child: Icon(
              _getStatusIcon(status),
              size: 40,
              color: _getIconColor(status),
            ),
          ),

          const SizedBox(height: AppSpacing.xl),

          // Status Title
          H2Bold(
            text: _getStatusTitle(status),
            color: AppColors.brandNeutral900,
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: AppSpacing.sm),

          // Status Message
          B3Regular(
            text: _getStatusMessage(status),
            color: AppColors.brandNeutral600,
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: AppSpacing.xl),

          // Application Status Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.brandNeutral200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    B3Bold(
                      text: 'Application Status',
                      color: AppColors.brandNeutral900,
                    ),
                    ApplicationStatusBadge(status: status),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                _buildInfoRow('Application ID', '#${application.id ?? 'N/A'}'),
                if (application.createdAt != null)
                  _buildInfoRow(
                    'Submitted on',
                    _formatDate(application.createdAt!),
                  ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.xl),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          B4Regular(
            text: label,
            color: AppColors.brandNeutral600,
          ),
          B4Bold(
            text: value,
            color: AppColors.brandNeutral900,
          ),
        ],
      ),
    );
  }

  Color _getIconBackgroundColor(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.approved:
        return AppColors.stateGreen100;
      case ApplicationStatus.pending:
        return const Color(0xFFFFF3CD);
      case ApplicationStatus.rejected:
        return AppColors.stateRed100;
      case ApplicationStatus.underReview:
        return AppColors.brandPrimary100;
    }
  }

  Color _getIconColor(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.approved:
        return AppColors.stateGreen600;
      case ApplicationStatus.pending:
        return const Color(0xFF856404);
      case ApplicationStatus.rejected:
        return AppColors.stateRed600;
      case ApplicationStatus.underReview:
        return AppColors.brandPrimary600;
    }
  }

  IconData _getStatusIcon(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.approved:
        return Icons.check_circle;
      case ApplicationStatus.pending:
        return Icons.schedule;
      case ApplicationStatus.rejected:
        return Icons.cancel;
      case ApplicationStatus.underReview:
        return Icons.rate_review;
    }
  }

  String _getStatusTitle(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.approved:
        return 'Congratulations!';
      case ApplicationStatus.pending:
        return 'Application Submitted';
      case ApplicationStatus.rejected:
        return 'Application Not Approved';
      case ApplicationStatus.underReview:
        return 'Under Review';
    }
  }

  String _getStatusMessage(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.approved:
        return 'Your worker application has been approved!';
      case ApplicationStatus.pending:
        return 'Your application is being reviewed. We\'ll notify you once it\'s processed.';
      case ApplicationStatus.rejected:
        return 'Your application was not approved. Please contact support for more information.';
      case ApplicationStatus.underReview:
        return 'Your application is currently being reviewed by our team.';
    }
  }

  String _formatDate(DateTime date) {
    final months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }
}