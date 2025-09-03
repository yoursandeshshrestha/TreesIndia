import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/material.dart';

class ValidationMessage {
  final String message;
  final IconData icon;
  final bool isValid;
  final Color color; // Add color property

  ValidationMessage(
    this.message,
    this.icon, {
    this.isValid = false,
    this.color = AppColors.stateRed600,
  });

  @override
  String toString() {
    return 'ValidationMessage(message: $message, icon: $icon, isValid: $isValid, color: $color)';
  }
}
