import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';

enum ApplicationStatus {
  pending,
  approved,
  rejected,
  underReview,
}

class ApplicationStatusBadge extends StatelessWidget {
  final ApplicationStatus status;
  final double? fontSize;

  const ApplicationStatusBadge({
    super.key,
    required this.status,
    this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: _getBackgroundColor(),
        borderRadius: BorderRadius.circular(12),
      ),
      child: B4Bold(
        text: _getStatusText(),
        color: _getTextColor(),
      ),
    );
  }

  Color _getBackgroundColor() {
    switch (status) {
      case ApplicationStatus.approved:
        return AppColors.stateGreen50;
      case ApplicationStatus.pending:
        return const Color(0xFFFFF3CD); // Light orange/yellow
      case ApplicationStatus.rejected:
        return AppColors.stateRed50;
      case ApplicationStatus.underReview:
        return AppColors.brandPrimary50;
    }
  }

  Color _getTextColor() {
    switch (status) {
      case ApplicationStatus.approved:
        return AppColors.stateGreen700;
      case ApplicationStatus.pending:
        return const Color(0xFF856404); // Dark orange/yellow
      case ApplicationStatus.rejected:
        return AppColors.stateRed700;
      case ApplicationStatus.underReview:
        return AppColors.brandPrimary700;
    }
  }

  String _getStatusText() {
    switch (status) {
      case ApplicationStatus.approved:
        return 'APPROVED';
      case ApplicationStatus.pending:
        return 'PENDING';
      case ApplicationStatus.rejected:
        return 'REJECTED';
      case ApplicationStatus.underReview:
        return 'UNDER REVIEW';
    }
  }

  static ApplicationStatus fromString(String statusString) {
    switch (statusString.toLowerCase()) {
      case 'approved':
        return ApplicationStatus.approved;
      case 'pending':
        return ApplicationStatus.pending;
      case 'rejected':
        return ApplicationStatus.rejected;
      case 'under_review':
      case 'under review':
        return ApplicationStatus.underReview;
      default:
        return ApplicationStatus.pending;
    }
  }
}