import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:flutter/material.dart';

abstract class BaseSnackbarWidget extends StatelessWidget {
  final String message;
  final bool isDismissible;
  final Duration duration;
  final IconData? icon;
  final EdgeInsets margin;
  final EdgeInsets padding;

  const BaseSnackbarWidget({
    required this.message,
    this.isDismissible = true,
    this.duration = const Duration(seconds: 5),
    this.icon,
    this.margin = const EdgeInsets.all(16),
    this.padding = const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
    super.key,
  });

  // Abstract methods that must be implemented by subclasses
  Color getBackgroundColor();
  Color getTextColor();
  Color getBorderColor();
  IconData? getDefaultIcon();

  SnackBar createSnackBar() {
    return SnackBar(
      behavior: SnackBarBehavior.floating,
      backgroundColor: getBackgroundColor(),
      duration: duration,
      margin: margin,
      padding: padding,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: getBorderColor(), width: 1),
      ),
      dismissDirection:
          isDismissible ? DismissDirection.down : DismissDirection.none,
      content: Row(
        children: [
          if (icon != null || getDefaultIcon() != null) ...[
            Icon(
              icon ?? getDefaultIcon()!,
              size: 20,
              color: getTextColor(),
            ),
            const SizedBox(width: 8),
          ],
          Expanded(
            child: B3Regular(
              text: message,
              color: getTextColor(),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      child: createSnackBar(),
    );
  }
}
