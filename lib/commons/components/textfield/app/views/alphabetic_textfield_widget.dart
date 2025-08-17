import 'package:trees_india/commons/components/textfield/app/viewmodels/alphabetic_textfield_viewmodel.dart';
import 'package:trees_india/commons/components/textfield/app/viewmodels/base_textfield_viewmodel.dart';
import 'package:trees_india/commons/components/textfield/app/views/base_textfield_widget.dart';
import 'package:trees_india/commons/components/textfield/domain/entities/textfield_entity.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AlphabeticTextfieldWidget extends BaseTextfieldWidget {
  final String initialText;
  final bool hasClearTextButton;
  final IconData? leadingIcon;
  final double? leadingIconSize;
  final IconData? trailingIcon;

  const AlphabeticTextfieldWidget({
    super.key,
    required super.onTextChanged,
    this.initialText = '',
    this.hasClearTextButton = false,
    this.leadingIcon,
    this.leadingIconSize,
    this.trailingIcon,
    String? hintText,
    super.enabled,
    super.readOnly,
    super.focusNode,
  }) : super(
          hintText: hintText ?? '',
        );

  @override
  AlphabeticTextfieldWidgetState createState() =>
      AlphabeticTextfieldWidgetState();
}

class AlphabeticTextfieldWidgetState
    extends BaseTextfieldWidgetState<AlphabeticTextfieldWidget> {
  @override
  BaseTextFieldViewModel createViewModel() {
    return AlphabeticTextfieldViewmodel(
      TextFieldEntity(
        text: widget.initialText,
        hasClearTextButton: widget.hasClearTextButton,
        leadingIcon: widget.leadingIcon,
        trailingIcon: widget.trailingIcon,
        leadingIconSize: widget.leadingIconSize,
        inputFormatters: [
          FilteringTextInputFormatter.deny(RegExp(r'^\s')),
          FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z\s]')),
          LengthLimitingTextInputFormatter(200),
        ],
      ),
    );
  }

  @override
  Widget? buildLeadingIcon(TextFieldEntity state) {
    if (state.leadingIcon == null) return null;

    return Padding(
      padding: const EdgeInsetsDirectional.only(start: 16.0, end: 8.0),
      child: Icon(
        state.leadingIcon!,
        size: state.leadingIconSize,
      ),
    );
  }
}
