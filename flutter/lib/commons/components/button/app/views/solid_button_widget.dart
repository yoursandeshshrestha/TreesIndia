import 'package:trees_india/commons/components/button/domain/entities/button_entity.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/material.dart';
import 'base_button_widget.dart';

class SolidButtonWidget extends BaseButtonWidget {
  final Color? backgroundColor; // Optional background color
  final Color? disableBackgroundColor;
  final BorderSide? border; // Optional border
  final Color? iconColor;

  SolidButtonWidget({
    required String label,
    Color? labelColor,
    IconData? icon,
    bool isLeadingIcon = true,
    bool isEnabled = true,
    this.backgroundColor, // Accept custom background color
    this.disableBackgroundColor,
    this.border, // Accept custom border
    this.iconColor,
    required super.onPressed,
    super.isLoading = false,
    super.key,
  }) : super(
          entity: ButtonEntity(
            label: label,
            labelColor: labelColor ?? AppColors.brandPrimary50,
            icon: icon,
            isLeadingIcon: isLeadingIcon,
            isEnabled: isEnabled,
            isSolid: true,
            iconColor: iconColor ?? AppColors.brandPrimary50,
          ),
        );

  @override
  Widget buildButtonContent(BuildContext context) {
    return SizedBox(
      height: 48.0,
      child: ElevatedButton(
        onPressed: entity.isEnabled ? onPressed : null,
        style: ElevatedButton.styleFrom(
          disabledBackgroundColor: disableBackgroundColor ??
              const Color(0xFF055c3a)
                  .withOpacity(0.3), // Main app color with opacity
          backgroundColor:
              backgroundColor ?? const Color(0xFF055c3a), // Main app color
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0),
            side: border ?? BorderSide.none, // Use custom border or none
          ),
        ),
        child: FittedBox(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isLoading)
                buildLoadingIndicator()
              else ...[
                if (entity.isLeadingIcon) buildIcon(),
                if (entity.icon != null) const SizedBox(width: 8),
                buildLabel(),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
