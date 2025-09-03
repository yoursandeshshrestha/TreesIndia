import 'package:flutter/material.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/components/textfield/domain/entities/validation_message_entity.dart';

class PasswordValidator {
  static bool isValid(String password) {
    return password.length >= 6; // Add other validation checks as needed
  }

  static List<ValidationMessage> validate(
      String password, BuildContext context) {
    final List<ValidationMessage> validationMessages = [];
    final bool isEmpty = password.isEmpty;

    // Determine the color based on the state
    Color getColor(bool isValid) {
      if (isEmpty || isValid) {
        return AppColors.brandNeutral600;
      } else {
        return AppColors.stateRed600;
      }
    }

    // Minimum 6 characters in length
    final minLengthError = password.length < 6;
    validationMessages.add(ValidationMessage(
        'Password must be at least 6 characters', Icons.info,
        isValid: !minLengthError && !isEmpty,
        color: getColor(!minLengthError && !isEmpty)));

    // Add other validation rules here

    return validationMessages;
  }
}
