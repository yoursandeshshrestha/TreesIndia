import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

class BookingInfoSectionWidget extends StatelessWidget {
  final String title;
  final List<String> info;

  const BookingInfoSectionWidget({
    super.key,
    required this.title,
    required this.info,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.brandNeutral200),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          B2Bold(
            text: title,
            color: AppColors.brandNeutral900,
          ),
          const SizedBox(height: AppSpacing.sm),
          ...info.map((text) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.xs),
                child: B3Regular(
                  text: text,
                  color: AppColors.brandNeutral700,
                ),
              )),
        ],
      ),
    );
  }
}