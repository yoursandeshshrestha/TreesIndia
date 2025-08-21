// import 'package:trees_india/commons/components/textfield/app/viewmodels/base_textfield_viewmodel.dart';
// import 'package:trees_india/commons/components/textfield/domain/entities/textfield_entity.dart';
// import 'package:trees_india/commons/components/textfield/domain/entities/validation_message_entity.dart';
// import 'package:trees_india/commons/components/textfield/utilities/password_multi_validator.dart';
// import 'package:trees_india/commons/constants/app_colors.dart';
// import 'package:trees_india/commons/constants/enums.dart';
// import 'package:flutter/material.dart';

// class PasswordTextFieldMultiValidationViewModel extends BaseTextFieldViewModel {
//   final bool showVisibilityToggle;

//   PasswordTextFieldMultiValidationViewModel(
//     super.initialState, {
//     this.showVisibilityToggle = true,
//   });

//   PasswordStrength calculateStrength(
//       TextFieldEntity state, BuildContext context) {
//     if (state.text.isEmpty) return PasswordStrength.none;

//     final validations = validateText(state, context);
//     final passedValidations = validations.where((v) => v.isValid).length;

//     if (passedValidations <= 2) return PasswordStrength.veryWeak;
//     if (passedValidations <= 4) return PasswordStrength.weak;
//     if (passedValidations <= 5) return PasswordStrength.medium;
//     return PasswordStrength.strong;
//   }

//   Color getStrengthSegmentColor(PasswordStrength strength, int segmentIndex) {
//     switch (strength) {
//       case PasswordStrength.veryWeak:
//         return segmentIndex == 0
//             ? AppColors.stateRed600
//             : AppColors.brandNeutral200;
//       case PasswordStrength.weak:
//         return segmentIndex <= 1
//             ? AppColors.brandSecondary500
//             : AppColors.brandNeutral200;
//       case PasswordStrength.medium:
//         return segmentIndex <= 2
//             ? AppColors.stateYellow400
//             : AppColors.brandNeutral200;
//       case PasswordStrength.strong:
//         return AppColors.stateGreen600;
//       case PasswordStrength.none:
//         return AppColors.brandNeutral200;
//     }
//   }

//   Color getStrengthTextColor(PasswordStrength strength) {
//     switch (strength) {
//       case PasswordStrength.veryWeak:
//         return AppColors.stateRed600;
//       case PasswordStrength.weak:
//         return AppColors.brandSecondary500;
//       case PasswordStrength.medium:
//         return AppColors.stateYellow600;
//       case PasswordStrength.strong:
//         return AppColors.stateGreen700;
//       case PasswordStrength.none:
//         return AppColors.brandNeutral200;
//     }
//   }

//   String getStrengthText(BuildContext context, PasswordStrength strength) {
//     switch (strength) {
//       case PasswordStrength.veryWeak:
//         return 'Very weak';
//       case PasswordStrength.weak:
//         return 'Weak';
//       case PasswordStrength.medium:
//         return 'Medium';
//       case PasswordStrength.strong:
//         return 'Strong';
//       case PasswordStrength.none:
//         return '';
//     }
//   }

//   @override
//   bool isValid(String text, BuildContext context) {
//     return PasswordMultiValidator.isValid(text);
//   }

//   @override
//   List<ValidationMessage> validateText(
//       TextFieldEntity state, BuildContext context) {
//     if (state.text.isNotEmpty) {
//       return PasswordMultiValidator.validate(state.text, context);
//     }
//     return [];
//   }
// }
