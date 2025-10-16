import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/worker_application/app/views/widgets/file_upload_widget.dart';
import '../../providers/broker_application_providers.dart';

class DocumentsStep extends ConsumerStatefulWidget {
  const DocumentsStep({super.key});

  @override
  ConsumerState<DocumentsStep> createState() => _DocumentsStepState();
}

class _DocumentsStepState extends ConsumerState<DocumentsStep> {
  final Map<String, String?> _errors = {};

  void _updateAadhaarCard(String? filePath) {
    setState(() {
      _errors.clear();
    });

    if (filePath == null) {
      ref.read(brokerApplicationNotifierProvider.notifier).updateDocuments(
        removeAadhaarCard: true,
      );
    } else {
      ref.read(brokerApplicationNotifierProvider.notifier).updateDocuments(
        aadhaarCard: filePath,
      );
    }

    _validateDocuments();
  }

  void _updatePanCard(String? filePath) {
    setState(() {
      _errors.clear();
    });

    if (filePath == null) {
      ref.read(brokerApplicationNotifierProvider.notifier).updateDocuments(
        removePanCard: true,
      );
    } else {
      ref.read(brokerApplicationNotifierProvider.notifier).updateDocuments(
        panCard: filePath,
      );
    }

    _validateDocuments();
  }

  void _updateProfilePhoto(String? filePath) {
    setState(() {
      _errors.clear();
    });

    if (filePath == null) {
      ref.read(brokerApplicationNotifierProvider.notifier).updateDocuments(
        removeProfilePhoto: true,
      );
    } else {
      ref.read(brokerApplicationNotifierProvider.notifier).updateDocuments(
        profilePhoto: filePath,
      );
    }

    _validateDocuments();
  }

  void _validateDocuments() {
    final brokerState = ref.read(brokerApplicationNotifierProvider);
    final documents = brokerState.formData.documents;

    if (!documents.hasAadhaarCard) {
      _errors['aadhaarCard'] = 'Aadhaar card is required';
    }

    if (!documents.hasPanCard) {
      _errors['panCard'] = 'PAN card is required';
    }

    if (!documents.hasProfilePhoto) {
      _errors['profilePhoto'] = 'Profile photo is required';
    }

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final brokerState = ref.watch(brokerApplicationNotifierProvider);
    final documents = brokerState.formData.documents;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        H3Bold(
          text: 'Document Upload',
          color: AppColors.brandNeutral900,
        ),
        const SizedBox(height: AppSpacing.sm),
        B3Regular(
          text: 'Upload all required documents (max 1MB each)',
          color: AppColors.brandNeutral600,
        ),
        const SizedBox(height: AppSpacing.xl),

        // Aadhaar Card
        FileUploadWidget(
          label: 'Aadhaar Card',
          filePath: documents.aadhaarCard,
          isRequired: true,
          errorText: _errors['aadhaarCard'],
          onFileSelected: (filePath) {
            _updateAadhaarCard(filePath);
          },
        ),

        const SizedBox(height: AppSpacing.lg),

        // PAN Card
        FileUploadWidget(
          label: 'PAN Card',
          filePath: documents.panCard,
          isRequired: true,
          errorText: _errors['panCard'],
          onFileSelected: (filePath) {
            _updatePanCard(filePath);
          },
        ),

        const SizedBox(height: AppSpacing.lg),

        // Profile Photo
        FileUploadWidget(
          label: 'Profile Photo',
          filePath: documents.profilePhoto,
          isRequired: true,
          errorText: _errors['profilePhoto'],
          onFileSelected: (filePath) {
            _updateProfilePhoto(filePath);
          },
        ),

        const SizedBox(height: AppSpacing.md),

        // Help text
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.brandPrimary50,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.brandPrimary200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.info_outline,
                    color: AppColors.brandPrimary600,
                    size: 20,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  B3Bold(
                    text: 'Document Requirements',
                    color: AppColors.brandPrimary700,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              B4Regular(
                text: '• All documents must be clear and readable\n'
                      '• Maximum file size: 1MB per document\n'
                      '• Accepted formats: JPG, PNG',
                color: AppColors.brandPrimary600,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
