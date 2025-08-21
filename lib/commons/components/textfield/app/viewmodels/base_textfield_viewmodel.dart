import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../../domain/entities/textfield_entity.dart';
import '../../domain/entities/validation_message_entity.dart';

/// Core ViewModel for all text‐fields.
/// Validation will only run once markDirty() is called (on blur).
class BaseTextFieldViewModel extends ChangeNotifier
    implements ValueListenable<TextFieldEntity> {
  TextFieldEntity _state;

  BaseTextFieldViewModel(TextFieldEntity initialState) : _state = initialState;

  @override
  TextFieldEntity get value => _state;

  /// Called when the field loses focus.  Enables validation.
  void markDirty() {
    if (!_state.isDirty) {
      _state = _state.copyWith(isDirty: true);
      notifyListeners();
    }
  }

  /// Always update text, but do NOT set isDirty here.
  void updateText(String newText) {
    final processedText =
        _state.isAllowedSpaces ? newText : newText.replaceAll(' ', '');
    _state = _state.copyWith(text: processedText);
    notifyListeners();
  }

  /// Clear text and reset dirty flag.
  void clearText() {
    _state = _state.copyWith(text: '', isDirty: false);
    notifyListeners();
  }

  /// Toggle password‐obscure.
  void toggleObscureText() {
    _state = _state.copyWith(obscureText: !_state.obscureText);
    notifyListeners();
  }

  /// Subclasses override to return field‐specific messages.
  List<ValidationMessage> validateText(TextFieldEntity state, BuildContext context) => [];

  /// Subclasses override to determine overall validity.
  bool isValid(String text, BuildContext context) => false;
}
