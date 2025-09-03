import 'package:trees_india/commons/components/textfield/app/viewmodels/base_textfield_viewmodel.dart';
import 'package:flutter/material.dart';

class AlphabeticTextfieldViewmodel extends BaseTextFieldViewModel {
  AlphabeticTextfieldViewmodel(super.initialState);

  @override
  bool isValid(String text, BuildContext context) {
    if (text.isEmpty) {
      return false;
    }
    return true;
  }
}
