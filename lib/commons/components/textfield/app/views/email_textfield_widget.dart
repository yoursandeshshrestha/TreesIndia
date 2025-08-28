import 'package:trees_india/commons/components/textfield/app/viewmodels/base_textfield_viewmodel.dart';
import 'package:trees_india/commons/components/textfield/app/viewmodels/email_textfield_viewmodel.dart';
import 'package:trees_india/commons/components/textfield/domain/entities/textfield_entity.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'base_textfield_widget.dart';

class EmailTextFieldWidget extends BaseTextfieldWidget {
  final String initialText;
  final bool hasClearTextButton;
  final IconData? leadingIcon;
  final IconData? trailingIcon;
  final BuildContext? context;

  const EmailTextFieldWidget({
    super.key,
    this.initialText = '',
    this.hasClearTextButton = false,
    this.leadingIcon,
    this.trailingIcon,
    this.context,
    // forward enable/readOnly/error
    super.enabled,
    super.readOnly,
    super.hasError,
    // your hint & onTextChanged
    String? hintText,
    required super.onTextChanged,
    // NEW: optional callbacks
    super.onBlurred,
    super.onFocused,
    super.onSubmitted,
    super.focusNode,
  }) : super(
          hintText: hintText ?? 'e.g. name@example.com',
        );

  @override
  EmailTextFieldWidgetState createState() => EmailTextFieldWidgetState();
}

class EmailTextFieldWidgetState
    extends BaseTextfieldWidgetState<EmailTextFieldWidget> {
  @override
  BaseTextFieldViewModel createViewModel() {
    return EmailTextFieldViewModel(
      TextFieldEntity(
        text: widget.initialText,
        hasClearTextButton: widget.hasClearTextButton,
        leadingIcon: widget.leadingIcon,
        trailingIcon: widget.trailingIcon,
        keyboardType: TextInputType.emailAddress,
        hasError: widget.hasError,
        inputFormatters: [
          FilteringTextInputFormatter.deny(RegExp(r'\s')),
          LengthLimitingTextInputFormatter(200),
        ],
      ),
    );
  }
}
