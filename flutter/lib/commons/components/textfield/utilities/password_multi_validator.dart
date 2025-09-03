import 'package:trees_india/commons/components/textfield/domain/entities/validation_message_entity.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/material.dart';

class PasswordMultiValidator {
  static bool isValid(String password) {
    if (password.isEmpty) return false;

    final bool hasMinLength = password.length >= 5;
    final bool hasMaxLength = password.length <= 15;
    final bool hasUpperCase = RegExp(r'[A-Z]').hasMatch(password);
    final bool hasLowerCase = RegExp(r'[a-z]').hasMatch(password);
    final bool hasNumber = RegExp(r'\d').hasMatch(password);
    final bool hasSymbol = RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(password);

    return hasMinLength &&
        hasMaxLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSymbol;
  }

  static List<ValidationMessage> validate(
      String password, BuildContext context) {
    final List<ValidationMessage> validationMessages = [];
    final bool isEmpty = password.isEmpty;

    Color getColor(bool isValid) {
      if (isEmpty) {
        return AppColors.brandNeutral600;
      } else if (isValid) {
        return AppColors.stateGreen700;
      } else {
        return AppColors.stateRed700;
      }
    }

    // Minimum 5 characters in length
    final minLengthError = password.length < 5;
    validationMessages.add(ValidationMessage(
      'Minimum 5 characters in length',
      isEmpty ? Icons.info : (minLengthError ? Icons.close : Icons.check),
      isValid: !minLengthError && !isEmpty,
      color: getColor(!minLengthError && !isEmpty),
    ));

    // Maximum 15 characters in length
    final maxLengthError = password.length > 15;
    validationMessages.add(ValidationMessage(
      'Maximum 15 characters in length',
      isEmpty ? Icons.info : (maxLengthError ? Icons.close : Icons.check),
      isValid: !maxLengthError && !isEmpty,
      color: getColor(!maxLengthError && !isEmpty),
    ));

    // At least 1 uppercase character
    final upperCaseError = !RegExp(r'[A-Z]').hasMatch(password);
    validationMessages.add(ValidationMessage(
      'Has atleast 1 upper case character(A-Z)',
      isEmpty ? Icons.info : (upperCaseError ? Icons.close : Icons.check),
      isValid: !upperCaseError && !isEmpty,
      color: getColor(!upperCaseError && !isEmpty),
    ));

    // At least 1 lowercase character
    final lowerCaseError = !RegExp(r'[a-z]').hasMatch(password);
    validationMessages.add(ValidationMessage(
      'Has atleast 1 lower case character(a-z)',
      isEmpty ? Icons.info : (lowerCaseError ? Icons.close : Icons.check),
      isValid: !lowerCaseError && !isEmpty,
      color: getColor(!lowerCaseError && !isEmpty),
    ));

    // At least 1 number
    final numberError = !RegExp(r'\d').hasMatch(password);
    validationMessages.add(ValidationMessage(
      'Has atleast 1 number [0-9]',
      isEmpty ? Icons.info : (numberError ? Icons.close : Icons.check),
      isValid: !numberError && !isEmpty,
      color: getColor(!numberError && !isEmpty),
    ));

    // At least 1 symbol
    final symbolError = !RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(password);
    validationMessages.add(ValidationMessage(
      'Has atleast 1 symbol',
      isEmpty ? Icons.info : (symbolError ? Icons.close : Icons.check),
      isValid: !symbolError && !isEmpty,
      color: getColor(!symbolError && !isEmpty),
    ));

    return validationMessages;
  }
}
