import 'package:trees_india/commons/components/textfield/app/viewmodels/base_textfield_viewmodel.dart';
import 'package:trees_india/commons/components/textfield/app/views/base_textfield_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../domain/entities/textfield_entity.dart';
import '../viewmodels/alpha_numeric_textfield_viewmodel.dart';

class AlphaNumericTextfieldwithspacecommaanddashWidget
    extends BaseTextfieldWidget {
  final String initialText;
  final bool hasClearTextButton;
  final IconData? leadingIcon;
  final double? leadingIconSize;
  final IconData? trailingIcon;
  final bool isAllowedSpaces;
  final List<TextInputFormatter>? inputFormatters;
  final bool? isCapitals;
  final TextCapitalization textCapitalization;

  const AlphaNumericTextfieldwithspacecommaanddashWidget({
    super.key,
    this.initialText = '',
    this.hasClearTextButton = false,
    this.leadingIcon,
    this.leadingIconSize,
    this.trailingIcon,
    this.isAllowedSpaces = true,
    String? hintText,
    super.enabled,
    super.readOnly,
    super.focusNode,
    required super.onTextChanged,
    this.inputFormatters,
    this.isCapitals = false,
    this.textCapitalization = TextCapitalization.none,
  }) : super(
          hintText: hintText ?? '',
        );

  @override
  AlphaNumericTextfieldWidgetState createState() =>
      AlphaNumericTextfieldWidgetState();
}

class AlphaNumericTextfieldWidgetState extends BaseTextfieldWidgetState<
    AlphaNumericTextfieldwithspacecommaanddashWidget> {
  @override
  BaseTextFieldViewModel createViewModel() {
    return AlphaNumericTextfieldViewmodel(
      TextFieldEntity(
        text: widget.initialText,
        hasClearTextButton: widget.hasClearTextButton,
        leadingIcon: widget.leadingIcon,
        trailingIcon: widget.trailingIcon,
        leadingIconSize: widget.leadingIconSize,
        isAllowedSpaces: widget.isAllowedSpaces,
        textCapitalization: widget.textCapitalization,
        inputFormatters: widget.inputFormatters ??
            [
              FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9,\s\-.&?]')),
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
