import 'package:trees_india/commons/components/textfield/app/views/base_textfield_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../domain/entities/textfield_entity.dart';
import '../viewmodels/base_textfield_viewmodel.dart';
import '../viewmodels/numeric_textfield_viewmodel.dart';

class NumericTextfiledWoSpaceWidget extends BaseTextfieldWidget {
  final String initialText;
  final bool hasClearTextButton;
  final IconData? leadingIcon;
  final double? leadingIconSize;
  final IconData? trailingIcon;

  const NumericTextfiledWoSpaceWidget({
    super.key,
    this.initialText = '',
    this.hasClearTextButton = false,
    this.leadingIcon,
    this.leadingIconSize,
    this.trailingIcon,
    String? hintText,
    super.enabled,
    super.readOnly,
    super.focusNode,
    required super.onTextChanged,
  }) : super(
          hintText: hintText ?? '',
        );

  @override
  NumericTextfieldWidgetState createState() => NumericTextfieldWidgetState();
}

class NumericTextfieldWidgetState
    extends BaseTextfieldWidgetState<NumericTextfiledWoSpaceWidget> {
  @override
  BaseTextFieldViewModel createViewModel() {
    return NumericTextfieldViewmodel(
      TextFieldEntity(
        text: widget.initialText,
        hasClearTextButton: widget.hasClearTextButton,
        leadingIcon: widget.leadingIcon,
        trailingIcon: widget.trailingIcon,
        leadingIconSize: widget.leadingIconSize,
        inputFormatters: [
          LengthLimitingTextInputFormatter(15),
          FilteringTextInputFormatter.allow(RegExp(r'[0-9]')),
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
}
