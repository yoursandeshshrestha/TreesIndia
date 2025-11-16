import 'package:flutter/foundation.dart';
import 'package:trees_india/commons/components/textfield/app/viewmodels/base_textfield_viewmodel.dart';
import 'package:trees_india/commons/components/textfield/domain/entities/textfield_entity.dart';
import 'package:trees_india/commons/components/textfield/domain/entities/validation_message_entity.dart';
import 'package:trees_india/commons/components/textfield/utilities/email_validator.dart';
import 'package:flutter/material.dart';

class EmailTextFieldViewModel extends BaseTextFieldViewModel {
  EmailTextFieldViewModel(super.initialState);

  @override
  List<ValidationMessage> validateText(
      TextFieldEntity state, BuildContext context) {
    if (kDebugMode) {
      print(
        'EmailTextFieldViewModel - isDirty: ${state.isDirty}, text: ${state.text}');
    }

    // Validate only if the field is dirty
    if (state.isDirty) {
      return EmailValidator.validate(state.text, context);
    }
    return [];
  }

  @override
  bool isValid(String text, BuildContext context) {
    return EmailValidator.validate(text, context).isEmpty;
  }
}
