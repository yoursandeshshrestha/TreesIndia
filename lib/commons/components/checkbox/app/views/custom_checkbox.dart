import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

class CustomCheckbox extends StatelessWidget {
  final VoidCallback onTap;
  final bool isChecked;
  final String text;
  final double size;

  final bool showReadMore;
  final bool showFullText;
  final VoidCallback? onToggleReadMore;

  const CustomCheckbox({
    super.key,
    required this.onTap,
    required this.isChecked,
    required this.text,
    this.size = 18,
    this.showReadMore = false,
    this.showFullText = false,
    this.onToggleReadMore,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            transitionBuilder: (child, animation) =>
                FadeTransition(opacity: animation, child: child),
            child: isChecked
                ? Icon(
                    Icons.check_box,
                    key: const ValueKey('checkedIcon'),
                    size: size,
                    color: AppColors.brandPrimary600,
                  )
                : Icon(
                    Icons.check_box_outline_blank,
                    key: const ValueKey('uncheckedIcon'),
                    size: size,
                    color: AppColors.brandNeutral700,
                  ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: DefaultTextStyle.of(context).style.copyWith(
                      fontSize: 14,
                      color: Colors.black,
                    ),
                children: [
                  TextSpan(text: text),
                  if (showReadMore && onToggleReadMore != null)
                    TextSpan(
                      text: showFullText ? ' Read less' : ' Read more',
                      style: const TextStyle(
                        color: AppColors.brandPrimary600,
                        fontWeight: FontWeight.w600,
                      ),
                      recognizer: TapGestureRecognizer()
                        ..onTap = onToggleReadMore,
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
