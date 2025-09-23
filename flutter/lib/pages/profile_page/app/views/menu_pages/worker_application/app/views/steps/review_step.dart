import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/button/app/views/outline_button_widget.dart';
import '../../providers/worker_application_providers.dart';
import '../../states/worker_application_state.dart';

class ReviewStep extends ConsumerWidget {
  const ReviewStep({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final workerState = ref.watch(workerApplicationNotifierProvider);
    final application = workerState.formData;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H3Bold(
          text: 'Review & Submit',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
          text: 'Please review your application before submitting',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.xl),

        // Personal Information Section
        _buildSection(
          context,
          ref,
          'Personal Information',
          WorkerApplicationStep.personalInfo,
          [
            _buildInfoRow('Full Name', application.contactInfo.fullName),
            _buildInfoRow('Email', application.contactInfo.email),
            _buildInfoRow('Phone', application.contactInfo.phone),
            _buildInfoRow(
                'Alternative Phone', application.contactInfo.alternativePhone),
          ],
        ),

        const SizedBox(height: AppSpacing.lg),

        // Documents Section
        _buildSection(
          context,
          ref,
          'Documents',
          WorkerApplicationStep.documents,
          [
            _buildDocumentRow(
                context, 'Aadhaar Card', application.documents.aadhaarCard),
            _buildDocumentRow(
                context, 'PAN Card', application.documents.panCard),
            _buildDocumentRow(
                context, 'Profile Photo', application.documents.profilePhoto),
            _buildDocumentRow(context, 'Police Verification',
                application.documents.policeVerification),
          ],
        ),

        const SizedBox(height: AppSpacing.lg),

        // Address Section
        _buildSection(
          context,
          ref,
          'Address Information',
          WorkerApplicationStep.address,
          [
            _buildInfoRow('Street', application.address.street),
            _buildInfoRow('City', application.address.city),
            _buildInfoRow('State', application.address.state),
            _buildInfoRow('Pincode', application.address.pincode),
            if (application.address.landmark?.isNotEmpty == true)
              _buildInfoRow('Landmark', application.address.landmark!),
          ],
        ),

        const SizedBox(height: AppSpacing.lg),

        // Skills Section
        _buildSection(
          context,
          ref,
          'Skills & Experience',
          WorkerApplicationStep.skills,
          [
            _buildInfoRow(
                'Experience', '${application.skills.experienceYears} years'),
            if (application.skills.skills.isNotEmpty)
              _buildSkillsRow('Skills', application.skills.skills),
          ],
        ),

        const SizedBox(height: AppSpacing.lg),

        // Banking Section
        _buildSection(
          context,
          ref,
          'Banking Information',
          WorkerApplicationStep.banking,
          [
            _buildInfoRow(
                'Account Holder', application.bankingInfo.accountHolderName),
            _buildInfoRow('Account Number',
                _maskAccountNumber(application.bankingInfo.accountNumber)),
            _buildInfoRow('IFSC Code', application.bankingInfo.ifscCode),
            _buildInfoRow('Bank Name', application.bankingInfo.bankName),
          ],
        ),

        const SizedBox(height: AppSpacing.xl),

        // Submission Info
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.stateGreen50,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.stateGreen200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.check_circle_outline,
                    color: AppColors.stateGreen600,
                    size: 20,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  B3Bold(
                    text: 'Ready to Submit',
                    color: AppColors.stateGreen700,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              B4Regular(
                text:
                    'By submitting this application, you confirm that all information provided is accurate and complete. '
                    'Your application will be reviewed by our team and you will be notified of the status.',
                color: AppColors.stateGreen600,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSection(
    BuildContext context,
    WidgetRef ref,
    String title,
    WorkerApplicationStep step,
    List<Widget> children,
  ) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.brandNeutral200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              B3Bold(
                text: title,
                color: AppColors.brandNeutral900,
              ),
              OutlinedButtonWidget(
                label: 'Edit',
                labelColor: AppColors.stateGreen600,
                borderColor: AppColors.stateGreen600,
                onPressed: () {
                  ref
                      .read(workerApplicationNotifierProvider.notifier)
                      .goToStep(step);
                },
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: B4Bold(
              text: '$label:',
              color: AppColors.brandNeutral600,
            ),
          ),
          Expanded(
            child: B4Regular(
              text: value.isNotEmpty ? value : 'Not provided',
              color: value.isNotEmpty
                  ? AppColors.brandNeutral900
                  : AppColors.brandNeutral400,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentRow(
      BuildContext context, String label, String? filePath) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: B4Bold(
              text: '$label:',
              color: AppColors.brandNeutral600,
            ),
          ),
          Expanded(
            child: Row(
              children: [
                Icon(
                  filePath?.isNotEmpty == true
                      ? Icons.check_circle
                      : Icons.cancel,
                  color: filePath?.isNotEmpty == true
                      ? AppColors.stateGreen600
                      : AppColors.stateRed600,
                  size: 16,
                ),
                const SizedBox(width: AppSpacing.xs),
                B4Regular(
                  text: filePath?.isNotEmpty == true
                      ? 'Uploaded'
                      : 'Not uploaded',
                  color: filePath?.isNotEmpty == true
                      ? AppColors.stateGreen600
                      : AppColors.stateRed600,
                ),
                if (filePath?.isNotEmpty == true) ...[
                  const SizedBox(width: AppSpacing.sm),
                  GestureDetector(
                    onTap: () => _showImagePreview(context, filePath!, label),
                    child: B4Regular(
                      text: 'View',
                      color: AppColors.brandPrimary600,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSkillsRow(String label, List<String> skills) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: B4Bold(
              text: '$label:',
              color: AppColors.brandNeutral600,
            ),
          ),
          Expanded(
            child: Wrap(
              spacing: AppSpacing.xs,
              runSpacing: AppSpacing.xs,
              children: skills.map((skill) {
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.brandPrimary50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: B4Regular(
                    text: skill,
                    color: AppColors.brandPrimary700,
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  String _maskAccountNumber(String accountNumber) {
    if (accountNumber.length <= 4) return accountNumber;
    final visiblePart = accountNumber.substring(accountNumber.length - 4);
    return 'XXXX-XXXX-$visiblePart';
  }

  void _showImagePreview(BuildContext context, String filePath, String label) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) =>
          _buildImagePreviewBottomSheet(context, filePath, label),
    );
  }

  Widget _buildImagePreviewBottomSheet(
      BuildContext context, String filePath, String label) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.brandNeutral300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                H3Bold(
                  text: label,
                  color: AppColors.brandNeutral900,
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(
                    Icons.close,
                    color: AppColors.brandNeutral600,
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1, color: AppColors.brandNeutral200),

          // Image content
          Expanded(
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.file(
                  File(filePath),
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      decoration: BoxDecoration(
                        color: AppColors.brandNeutral100,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.brandNeutral200),
                      ),
                      child: const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.error_outline,
                              color: AppColors.stateRed600,
                              size: 48,
                            ),
                            SizedBox(height: AppSpacing.md),
                            Text(
                              'Failed to load image',
                              style: TextStyle(
                                color: AppColors.stateRed600,
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            SizedBox(height: AppSpacing.sm),
                            Text(
                              'The document image could not be displayed',
                              style: TextStyle(
                                color: AppColors.brandNeutral600,
                                fontSize: 14,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ),

          // Bottom padding
          const SizedBox(height: AppSpacing.lg),
        ],
      ),
    );
  }
}
