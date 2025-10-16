import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/button/app/views/outline_button_widget.dart';
import '../../providers/broker_application_providers.dart';
import '../../states/broker_application_state.dart';

class ReviewStep extends ConsumerWidget {
  const ReviewStep({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brokerState = ref.watch(brokerApplicationNotifierProvider);
    final application = brokerState.formData;

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
          BrokerApplicationStep.personalInfo,
          [
            _buildInfoRow('Full Name', application.contactInfo.fullName),
            _buildInfoRow('Email', application.contactInfo.email),
            if (brokerState.emailError != null)
              Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: B4Regular(
                  text: brokerState.emailError!,
                  color: AppColors.stateRed600,
                ),
              ),
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
          BrokerApplicationStep.documents,
          [
            _buildDocumentRow(
                context, 'Aadhaar Card', application.documents.aadhaarCard),
            _buildDocumentRow(
                context, 'PAN Card', application.documents.panCard),
            _buildDocumentRow(
                context, 'Profile Photo', application.documents.profilePhoto),
          ],
        ),

        const SizedBox(height: AppSpacing.lg),

        // Address Section
        _buildSection(
          context,
          ref,
          'Address Information',
          BrokerApplicationStep.address,
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

        // Broker Details Section
        _buildSection(
          context,
          ref,
          'Broker Details',
          BrokerApplicationStep.brokerDetails,
          [
            _buildInfoRow('License Number', application.brokerDetails.licenseNumber),
            _buildInfoRow('Agency Name', application.brokerDetails.agencyName),
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
    BrokerApplicationStep step,
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
                      .read(brokerApplicationNotifierProvider.notifier)
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
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.brandNeutral300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
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
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
        ],
      ),
    );
  }
}
