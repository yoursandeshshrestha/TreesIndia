// lib/commons/components/snackbar/domain/entities/snackbar_entity.dart

import 'package:flutter/material.dart';

enum SnackbarType { informational, error, warning, success }

class SnackbarEntity {
  final String message;
  final SnackbarType type;
  final Duration duration;
  final bool isDismissible;
  final IconData? icon;
  final bool isSlideIn;

  SnackbarEntity({
    required this.message,
    required this.type,
    this.duration = const Duration(seconds: 3),
    this.isDismissible = true,
    this.icon,
    this.isSlideIn = true, // Default to slide-in animation
  });
}
