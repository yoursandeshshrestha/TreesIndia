import 'package:trees_india/commons/components/textfield/domain/entities/validation_message_entity.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/material.dart';

class MobileValidator {
  static bool isValid(String mobile) {
    if (mobile.isEmpty) return false;

    if (mobile.length != 10) return false;

    if (!RegExp(r'^[0-9]{10}$').hasMatch(mobile)) return false;

    // Should not start with 0 or 1 (Indian mobile number validation)
    if (mobile.startsWith('0') || mobile.startsWith('1')) return false;

    return true;
  }

  static List<ValidationMessage> validate(String mobile) {
    final List<ValidationMessage> validationMessages = [];

    if (mobile.isEmpty) {
      validationMessages.add(ValidationMessage(
        'Mobile number is required',
        Icons.info,
        isValid: false,
        color: AppColors.stateRed600,
      ));
      return validationMessages;
    }

    if (!RegExp(r'^[0-9]*$').hasMatch(mobile)) {
      validationMessages.add(ValidationMessage(
        'Mobile number should contain only digits',
        Icons.info,
        isValid: false,
        color: AppColors.stateRed600,
      ));
      return validationMessages;
    }

    if (mobile.length < 10) {
      validationMessages.add(ValidationMessage(
        'Mobile number must be 10 digits',
        Icons.info,
        isValid: false,
        color: AppColors.stateRed600,
      ));
      return validationMessages;
    }

    if (mobile.length > 10) {
      validationMessages.add(ValidationMessage(
        'Mobile number cannot be more than 10 digits',
        Icons.info,
        isValid: false,
        color: AppColors.stateRed600,
      ));
      return validationMessages;
    }

    // Check if starts with 0 or 1 (invalid for Indian mobile numbers)
    if (mobile.startsWith('0')) {
      validationMessages.add(ValidationMessage(
        'Mobile number cannot start with 0',
        Icons.info,
        isValid: false,
        color: AppColors.stateRed600,
      ));
      return validationMessages;
    }

    if (mobile.startsWith('1')) {
      validationMessages.add(ValidationMessage(
        'Mobile number cannot start with 1',
        Icons.info,
        isValid: false,
        color: AppColors.stateRed600,
      ));
      return validationMessages;
    }

    return validationMessages;
  }
}
