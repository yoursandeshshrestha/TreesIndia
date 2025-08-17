// lib/commons/components/snackbar/presentation/widgets/info_snackbar_widget.dart

import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/material.dart';
import 'base_snackbar_widget.dart';

class InfoSnackbarWidget extends BaseSnackbarWidget {
  const InfoSnackbarWidget({
    required super.message,
    super.icon,
    super.isDismissible,
    super.duration,
    super.key,
    super.margin,
    super.padding,
  });

  @override
  Color getBackgroundColor() => AppColors.brandPrimary100;

  @override
  Color getTextColor() => AppColors.brandPrimary700;

  @override
  Color getBorderColor() => AppColors.brandPrimary200;

  @override
  IconData? getDefaultIcon() => Icons.info;
}
