import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/material.dart';

class SimpleCustomCheckbox extends StatelessWidget {
  final bool isSelected;
  final VoidCallback onTap;
  final double size;

  const SimpleCustomCheckbox({
    super.key,
    required this.isSelected,
    required this.onTap,
    this.size = 24,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: size,
        height: size,
        child: isSelected
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
    );
  }
}
