// File: email_validator.dart

import 'package:trees_india/commons/components/textfield/domain/entities/validation_message_entity.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/material.dart';

class EmailValidator {
  BuildContext context;
  EmailValidator(String email, this.context);

  static bool isValid(String email, BuildContext? context) {
    if (email.isEmpty) {
      return false;
    }
    // Basic email regex pattern
    const emailPattern =
        r'^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$';
    return RegExp(emailPattern).hasMatch(email);
  }

  static List<ValidationMessage> validate(String email, BuildContext context) {
    final List<ValidationMessage> validationMessages = [];

    if (email.isEmpty) {
      validationMessages.add(ValidationMessage(
        'Email cannot be empty',
        Icons.info,
        isValid: false,
        color: AppColors.stateRed600,
      ));
    } else if (!isValid(email, context)) {
      validationMessages.add(ValidationMessage(
        'Please Enter a Valid Email',
        Icons.info,
        isValid: false,
        color: AppColors.stateRed600,
      ));
    }

    return validationMessages;
  }
}
