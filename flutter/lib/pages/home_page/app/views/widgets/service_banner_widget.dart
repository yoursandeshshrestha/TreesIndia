import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../../commons/constants/app_colors.dart';
import '../../../../../commons/constants/app_spacing.dart';
import '../../../../../commons/components/button/app/views/solid_button_widget.dart';

class ServiceBannerWidget extends StatelessWidget {
  final String title;
  final String description;
  final String buttonText;
  final VoidCallback? onButtonPressed;
  final Color backgroundColor;
  final Color textColor;
  final String? imagePath;

  const ServiceBannerWidget({
    super.key,
    required this.title,
    required this.description,
    required this.buttonText,
    this.onButtonPressed,
    this.backgroundColor = const Color(0xFFFBB040),
    this.textColor = AppColors.brandNeutral900,
    this.imagePath,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 300,
      margin: const EdgeInsets.only(right: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.brandNeutral900.withValues(alpha: 0.08),
            offset: const Offset(0, 4),
            blurRadius: 12,
            spreadRadius: 0,
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                B3Bold(
                  text: '#PromoToday',
                  color: textColor.withValues(alpha: 0.8),
                ),
                const SizedBox(height: AppSpacing.xs),
                H3Bold(
                  text: title,
                  color: textColor,
                  maxLines: 2,
                ),
                const SizedBox(height: AppSpacing.sm),
                SizedBox(
                  width: 100,
                  height: 36,
                  child: SolidButtonWidget(
                    label: buttonText,
                    onPressed: onButtonPressed ?? () {},
                    backgroundColor: AppColors.brandNeutral900,
                    labelColor: AppColors.white,
                  ),
                ),
              ],
            ),
          ),
          if (imagePath != null) ...[
            const SizedBox(width: AppSpacing.md),
            Expanded(
              flex: 1,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.asset(
                  imagePath!,
                  height: 100,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    if (kDebugMode) print(error);
                    return Container(
                      height: 100,
                      decoration: BoxDecoration(
                        color: textColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.image,
                        color: textColor.withValues(alpha: 0.5),
                        size: 40,
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
