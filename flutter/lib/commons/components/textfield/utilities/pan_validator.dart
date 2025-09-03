import 'package:trees_india/commons/components/textfield/domain/entities/validation_message_entity.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/material.dart';

class PanValidator {
  static bool isValid(String pan) {
    if (pan.isEmpty) return false;
    final regex = RegExp(r'^[A-Z]{5}[0-9]{4}[A-Z]$');
    return regex.hasMatch(pan);
  }

  static List<ValidationMessage> validate(String pan) {
    final List<ValidationMessage> validationMessages = [];

    if (pan.isEmpty) {
      validationMessages.add(ValidationMessage(
        'PAN is required',
        Icons.info,
        isValid: false,
        color: AppColors.stateRed600,
      ));
      return validationMessages;
    }

    // Check length first
    if (pan.length != 10) {
      validationMessages.add(ValidationMessage(
        'PAN must be exactly 10 characters',
        Icons.info,
        isValid: false,
        color: AppColors.stateRed600,
      ));
      return validationMessages;
    }

    // Check pattern
    if (!isValid(pan)) {
      // More specific validation messages
      final firstFive = pan.substring(0, 5);
      final middleFour = pan.substring(5, 9);
      final lastChar = pan.substring(9, 10);

      if (!RegExp(r'^[A-Z]{5}$').hasMatch(firstFive)) {
        validationMessages.add(ValidationMessage(
          'First 5 characters must be letters (A-Z)',
          Icons.info,
          isValid: false,
          color: AppColors.stateRed600,
        ));
      } else if (!RegExp(r'^[0-9]{4}$').hasMatch(middleFour)) {
        validationMessages.add(ValidationMessage(
          'Characters 6-9 must be digits (0-9)',
          Icons.info,
          isValid: false,
          color: AppColors.stateRed600,
        ));
      } else if (!RegExp(r'^[A-Z]$').hasMatch(lastChar)) {
        validationMessages.add(ValidationMessage(
          'Last character must be a letter (A-Z)',
          Icons.info,
          isValid: false,
          color: AppColors.stateRed600,
        ));
      } else {
        validationMessages.add(ValidationMessage(
          'Enter a valid PAN (e.g. ABCDE1234F)',
          Icons.info,
          isValid: false,
          color: AppColors.stateRed600,
        ));
      }
    }

    return validationMessages;
  }
}
