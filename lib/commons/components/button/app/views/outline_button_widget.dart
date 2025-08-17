import 'package:trees_india/commons/components/button/domain/entities/button_entity.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/material.dart';
import 'base_button_widget.dart';

class OutlinedButtonWidget extends BaseButtonWidget {
  OutlinedButtonWidget({
    required String label,
    Color? labelColor,
    IconData? icon,
    bool isLeadingIcon = true,
    bool isEnabled = true,
    Color? borderColor,
    required super.onPressed,
    super.key,
  }) : super(
          entity: ButtonEntity(
            label: label,
            labelColor: labelColor ?? AppColors.brandPrimary600,
            borderColor: borderColor,
            icon: icon,
            isLeadingIcon: isLeadingIcon,
            isEnabled: isEnabled,
            isSolid: false, // Not solid, it's outlined
          ),
        );

  @override
  Widget buildButtonContent(BuildContext context) {
    return SizedBox(
      height: 48.0,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          side: BorderSide(
            color: entity.borderColor ?? AppColors.brandPrimary600,
            width: 1.0,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0),
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
                if (entity.icon != null) const SizedBox(width: 10),
                buildLabel(),
                if (!entity.isLeadingIcon) buildIcon(),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
