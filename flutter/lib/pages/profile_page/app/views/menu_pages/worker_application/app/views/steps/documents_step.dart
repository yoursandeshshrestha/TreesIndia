import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import '../../providers/worker_application_providers.dart';
import '../widgets/file_upload_widget.dart';

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
      // Remove the document
      ref.read(workerApplicationNotifierProvider.notifier).updateDocuments(
        removeAadhaarCard: true,
      );
    } else {
      // Set/update the document
      ref.read(workerApplicationNotifierProvider.notifier).updateDocuments(
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
      // Remove the document
      ref.read(workerApplicationNotifierProvider.notifier).updateDocuments(
        removePanCard: true,
      );
    } else {
      // Set/update the document
      ref.read(workerApplicationNotifierProvider.notifier).updateDocuments(
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
      // Remove the document
      ref.read(workerApplicationNotifierProvider.notifier).updateDocuments(
        removeProfilePhoto: true,
      );
    } else {
      // Set/update the document
      ref.read(workerApplicationNotifierProvider.notifier).updateDocuments(
        profilePhoto: filePath,
      );
    }

    _validateDocuments();
  }

  void _updatePoliceVerification(String? filePath) {
    setState(() {
      _errors.clear();
    });

    if (filePath == null) {
      // Remove the document
      ref.read(workerApplicationNotifierProvider.notifier).updateDocuments(
        removePoliceVerification: true,
      );
    } else {
      // Set/update the document
      ref.read(workerApplicationNotifierProvider.notifier).updateDocuments(
        policeVerification: filePath,
      );
    }

    _validateDocuments();
  }

  void _validateDocuments() {
    final workerState = ref.read(workerApplicationNotifierProvider);
    final documents = workerState.formData.documents;

    if (!documents.hasAadhaarCard) {
      _errors['aadhaarCard'] = 'Aadhaar card is required';
    }

    if (!documents.hasPanCard) {
      _errors['panCard'] = 'PAN card is required';
    }

    if (!documents.hasProfilePhoto) {
      _errors['profilePhoto'] = 'Profile photo is required';
    }

    if (!documents.hasPoliceVerification) {
      _errors['policeVerification'] = 'Police verification is required';
    }

    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final workerState = ref.watch(workerApplicationNotifierProvider);
    final documents = workerState.formData.documents;

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

        const SizedBox(height: AppSpacing.lg),

        // Police Verification
        FileUploadWidget(
          label: 'Police Verification',
          filePath: documents.policeVerification,
          isRequired: true,
          errorText: _errors['policeVerification'],
          onFileSelected: (filePath) {
            _updatePoliceVerification(filePath);
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
                      '• Accepted formats: JPG, PNG\n'
                      '• Police verification should be recent',
                color: AppColors.brandPrimary600,
              ),
            ],
          ),
        ),
      ],
    );
  }
}