import 'package:trees_india/commons/components/textfield/app/viewmodels/base_textfield_viewmodel.dart';
import 'package:trees_india/commons/components/textfield/domain/entities/textfield_entity.dart';
import 'package:trees_india/commons/components/textfield/domain/entities/validation_message_entity.dart';
import 'package:trees_india/commons/components/textfield/utilities/password_validator.dart';
import 'package:flutter/material.dart';

class PasswordTextFieldViewModel extends BaseTextFieldViewModel {
  final bool showVisibilityToggle;
  final bool enableValidation;

  PasswordTextFieldViewModel(
    super.initialState, {
    this.showVisibilityToggle = true,
    this.enableValidation = true,
  });

  @override
  List<ValidationMessage> validateText(
      TextFieldEntity state, BuildContext context) {
    if (!enableValidation) return [];
    return PasswordValidator.validate(state.text, context);
  }

  @override
  bool isValid(String text, BuildContext context) {
    if (!enableValidation) return true;
    return PasswordValidator.isValid(text);
  }
}
