import 'package:trees_india/commons/components/textfield/app/viewmodels/base_textfield_viewmodel.dart';
import 'package:trees_india/commons/components/textfield/app/viewmodels/numeric_textfield_viewmodel.dart';
import 'package:trees_india/commons/components/textfield/app/views/base_textfield_widget.dart';
import 'package:trees_india/commons/components/textfield/domain/entities/textfield_entity.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class NumericTextfieldWidget extends BaseTextfieldWidget {
  final String initialText;
  final bool hasClearTextButton;
  final IconData? leadingIcon;
  final double? leadingIconSize;
  final IconData? trailingIcon;
  final bool isDecimalAllowed;
  final bool? obscureText;
  final List<TextInputFormatter>? inputFormatters;

  const NumericTextfieldWidget({
    super.key,
    this.initialText = '',
    this.hasClearTextButton = false,
    this.leadingIcon,
    this.leadingIconSize,
    this.trailingIcon,
    String? hintText,
    super.enabled,
    super.readOnly,
    this.obscureText = false,
    super.focusNode,
    required super.onTextChanged,
    this.isDecimalAllowed = false,
    this.inputFormatters,
  }) : super(
          hintText: hintText ?? '',
        );

  @override
  NumericTextfieldWidgetState createState() => NumericTextfieldWidgetState();
}

class NumericTextfieldWidgetState
    extends BaseTextfieldWidgetState<NumericTextfieldWidget> {
  @override
  BaseTextFieldViewModel createViewModel() {
    return NumericTextfieldViewmodel(
      TextFieldEntity(
        text: widget.initialText,
        obscureText: widget.obscureText!,
        hasClearTextButton: widget.hasClearTextButton,
        leadingIcon: widget.leadingIcon,
        trailingIcon: widget.trailingIcon,
        leadingIconSize: widget.leadingIconSize,
        inputFormatters: widget.inputFormatters ??
            [
              LengthLimitingTextInputFormatter(200),
              FilteringTextInputFormatter.allow(
                  RegExp(widget.isDecimalAllowed ? r'[0-9]|\.' : r'[0-9\s]'))
            ],
        keyboardType: TextInputType.number,
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

  @override
  Widget? buildTrailingIcon(TextFieldEntity state, BuildContext context) {
    if (state.trailingIcon == null) return null;

    return Padding(
      padding: const EdgeInsetsDirectional.only(start: 8.0, end: 16.0),
      child: Icon(
        state.trailingIcon!,
        size: 16,
      ),
    );
  }
}
