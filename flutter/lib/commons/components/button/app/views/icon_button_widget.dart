import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/button/app/views/base_button_widget.dart';
import 'package:trees_india/commons/components/button/domain/entities/button_entity.dart';
import 'package:trees_india/commons/constants/app_colors.dart';

class IconButtonWidget extends BaseButtonWidget {
  final double height;
  final double width;

  IconButtonWidget({
    super.key,
    required super.onPressed,
    required IconData icon,
    Color? backgroundColor,
    Color? iconColor,
    bool isLeadingIcon = true,
    bool isEnabled = true,
    super.isLoading = false,
    this.height = 32,
    this.width = 32,
  }) : super(
          entity: ButtonEntity(
            icon: icon,
            isLeadingIcon: isLeadingIcon,
            isEnabled: isEnabled,
            isSolid: true,
            iconColor: iconColor,
            backgroundColor: backgroundColor ?? Colors.transparent,
          ),
        );

  @override
  Widget buildButtonContent(BuildContext context) {
    return SizedBox(
      height: height,
      width: width,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          disabledBackgroundColor: AppColors.brandNeutral50,
          backgroundColor: entity.backgroundColor ?? AppColors.brandNeutral100,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4.0),
          ),
          elevation: 0.0,
        ),
        child: FittedBox(
          child: Icon(
            entity.icon!,
            color: entity.iconColor ?? AppColors.brandPrimary500,
          ),
        ),
      ),
    );
  }
}
