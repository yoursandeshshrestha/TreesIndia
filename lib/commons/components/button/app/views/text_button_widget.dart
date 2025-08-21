import 'package:trees_india/commons/components/button/domain/entities/button_entity.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/material.dart';
import 'base_button_widget.dart';

class TextButtonWidget extends BaseButtonWidget {
  TextButtonWidget({
    required String label,
    Color? labelColor,
    IconData? icon,
    bool isLeadingIcon = true,
    bool isEnabled = true,
    required super.onPressed,
    super.key,
  }) : super(
          entity: ButtonEntity(
            label: label,
            labelColor: labelColor,
            icon: icon,
            isLeadingIcon: isLeadingIcon,
            isEnabled: isEnabled,
            isSolid: false,
            hasBorder: false,
          ),
        );

  @override
  Widget buildButtonContent(BuildContext context) {
    return TextButton(
      onPressed: entity.isEnabled ? onPressed : null,
      style: TextButton.styleFrom(
          foregroundColor: entity.isEnabled
              ? (entity.labelColor ?? AppColors.brandPrimary600)
              : Colors.grey,
          side: BorderSide.none,
          padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 4)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (isLoading)
            buildLoadingIndicator()
          else ...[
            buildIcon(),
            if (entity.icon != null) const SizedBox(width: 8),
            buildLabel(),
          ],
        ],
      ),
    );
  }
}
