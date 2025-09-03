import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final VoidCallback? onBackPressed;
  final List<Widget>? actions;
  final bool centerTitle;
  final bool showBottomBorder;
  final Color? backgroundColor;
  final Color? titleColor;
  final Color? iconColor;
  final double? titleSize;
  final FontWeight? titleWeight;
  final IconData? backIcon;
  final double? elevation;
  final Widget? leading;
  final bool automaticallyImplyLeading;

  const CustomAppBar({
    super.key,
    required this.title,
    this.onBackPressed,
    this.actions,
    this.centerTitle = false,
    this.showBottomBorder = true,
    this.backgroundColor,
    this.titleColor,
    this.iconColor,
    this.titleSize,
    this.titleWeight,
    this.backIcon,
    this.elevation,
    this.leading,
    this.automaticallyImplyLeading = true,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(
        title,
        style: TextStyle(
          fontSize: titleSize ?? 18,
          fontWeight: titleWeight ?? FontWeight.w600,
          color: titleColor ?? AppColors.brandNeutral800,
        ),
      ),
      backgroundColor: backgroundColor ?? AppColors.white,
      foregroundColor: iconColor ?? AppColors.brandNeutral800,
      elevation: elevation ?? 0,
      centerTitle: centerTitle,
      titleSpacing: 0,
      automaticallyImplyLeading: automaticallyImplyLeading,
      leading: leading ?? _buildLeadingButton(context),
      actions: actions,
      bottom: showBottomBorder
          ? PreferredSize(
              preferredSize: const Size.fromHeight(1),
              child: Container(
                height: 1,
                color: AppColors.brandNeutral200,
              ),
            )
          : null,
    );
  }

  Widget _buildLeadingButton(BuildContext context) {
    if (onBackPressed == null && automaticallyImplyLeading) {
      return IconButton(
        icon: Icon(
          backIcon ?? Icons.chevron_left,
          color: iconColor ?? AppColors.brandNeutral800,
          size: 28,
        ),
        onPressed: () => Navigator.of(context).pop(),
      );
    } else if (onBackPressed != null) {
      return IconButton(
        icon: Icon(
          backIcon ?? Icons.chevron_left,
          color: iconColor ?? AppColors.brandNeutral800,
          size: 28,
        ),
        onPressed: onBackPressed,
      );
    }
    return const SizedBox.shrink();
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
