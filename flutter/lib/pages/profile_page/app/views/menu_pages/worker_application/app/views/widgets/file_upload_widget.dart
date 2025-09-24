import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:trees_india/commons/components/dashed_border/dashed_border.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/button/app/views/outline_button_widget.dart';

class FileUploadWidget extends StatelessWidget {
  final String label;
  final String? filePath;
  final Function(String?) onFileSelected;
  final bool isRequired;
  final String? errorText;

  const FileUploadWidget({
    super.key,
    required this.label,
    this.filePath,
    required this.onFileSelected,
    this.isRequired = false,
    this.errorText,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            B3Bold(
              text: label,
              color: AppColors.brandNeutral800,
            ),
            if (isRequired)
              const Text(
                ' *',
                style: TextStyle(color: AppColors.stateRed600),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        if (filePath?.isNotEmpty == true)
          _buildPreviewCard(context)
        else
          _buildUploadCard(),
        if (errorText != null) ...[
          const SizedBox(height: AppSpacing.xs),
          Text(
            errorText!,
            style: const TextStyle(
              color: AppColors.stateRed600,
              fontSize: 12,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildPreviewCard(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.brandNeutral300),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          GestureDetector(
            onTap: () => _showImagePreview(context, filePath!, label),
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
              child: Image.file(
                File(filePath!),
                width: double.infinity,
                height: 200,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    height: 200,
                    color: AppColors.brandNeutral100,
                    child: const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline,
                            color: AppColors.stateRed600,
                            size: 32,
                          ),
                          SizedBox(height: AppSpacing.sm),
                          Text(
                            'Failed to load image',
                            style: TextStyle(color: AppColors.stateRed600),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButtonWidget(
                    label: 'Remove',
                    labelColor: AppColors.stateRed600,
                    borderColor: AppColors.stateRed600,
                    onPressed: () => onFileSelected(null),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: SolidButtonWidget(
                    label: 'Change',
                    backgroundColor: AppColors.stateGreen600,
                    onPressed: _pickImage,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUploadCard() {
    return GestureDetector(
      onTap: _pickImage,
      child: Container(
        width: double.infinity,
        height: 120,
        decoration: ShapeDecoration(
          shape: DashedBorder(
            dashWidth: 6.0,
            dashSpace: 6.0,
            strokeWidth: 1.0,
            color: errorText != null
                ? AppColors.stateRed600
                : AppColors.brandNeutral400,
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.cloud_upload_outlined,
              size: 32,
              color: AppColors.brandNeutral500,
            ),
            const SizedBox(height: AppSpacing.sm),
            B3Regular(
              text: 'Upload $label',
              color: AppColors.brandNeutral600,
            ),
            const SizedBox(height: 4),
            B4Regular(
              text: 'JPG, PNG up to 1MB',
              color: AppColors.brandNeutral500,
            ),
          ],
        ),
      ),
    );
  }

  void _pickImage() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (image != null) {
        // Check file size (1MB = 1024 * 1024 bytes)
        final file = File(image.path);
        final fileSize = await file.length();

        if (fileSize > 1024 * 1024) {
          // File too large - could show error message
          return;
        }

        onFileSelected(image.path);
      }
    } catch (e) {
      // Handle error
      debugPrint('Error picking image: $e');
    }
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
