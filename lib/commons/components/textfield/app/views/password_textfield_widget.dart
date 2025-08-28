import 'package:trees_india/commons/components/textfield/app/viewmodels/base_textfield_viewmodel.dart';
import 'package:trees_india/commons/components/textfield/app/viewmodels/password_textfield_viewmodel.dart';
import 'package:trees_india/commons/components/textfield/domain/entities/textfield_entity.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:flutter/material.dart';

import 'base_textfield_widget.dart';

class PasswordTextFieldWidget extends BaseTextfieldWidget {
  final String initialText;
  final IconData? leadingIcon;
  final IconData? trailingIcon;
  final bool enableValidation;
  final bool showVisibilityToggle;

  const PasswordTextFieldWidget({
    super.key,
    this.initialText = '',
    this.leadingIcon,
    this.trailingIcon,
    this.showVisibilityToggle = true, // Configurable visibility toggle
    this.enableValidation = true,
    super.enabled,
    super.readOnly,
    String? hintText,
    required super.onTextChanged, // Accept the callback
  }) : super(
          hintText: hintText ?? 'Password',
        );

  @override
  PasswordTextFieldWidgetState createState() => PasswordTextFieldWidgetState();
}

class PasswordTextFieldWidgetState
    extends BaseTextfieldWidgetState<PasswordTextFieldWidget> {
  @override
  BaseTextFieldViewModel createViewModel() {
    return PasswordTextFieldViewModel(
      TextFieldEntity(
        text: widget.initialText,
        obscureText: true,
        leadingIcon: widget.leadingIcon,
        trailingIcon: widget.showVisibilityToggle
            ? Icons.visibility_off
            : widget.trailingIcon,
      ),
      enableValidation: widget.enableValidation,
    );
  }

  @override
  Widget? buildTrailingIcon(TextFieldEntity state, BuildContext context) {
    {
      final isValid = widget.enableValidation
          ? viewModel.isValid(state.text, context)
          : false;

      if (widget.showVisibilityToggle) {
        return Padding(
          padding:
              const EdgeInsetsDirectional.only(end: 16.0), // Add right padding
          child: Row(
            mainAxisAlignment: widget.enableValidation
                ? MainAxisAlignment.start
                : MainAxisAlignment.end,
            children: [
              if (widget.enableValidation) ...[
                SizedBox(
                  width: 18.0,
                  height: 18.0,
                  child: isValid
                      ? const Icon(
                          Icons.check_circle,
                          size: 18.0,
                          color: AppColors.stateGreen500,
                        )
                      : null,
                ),
                const SizedBox(width: 8.0),
              ],
              GestureDetector(
                onTap: viewModel.toggleObscureText,
                child: SizedBox(
                  width: 18.0,
                  height: 18.0,
                  child: Icon(
                    state.obscureText ? Icons.visibility_off : Icons.visibility,
                    size: 18.0,
                  ),
                ),
              ),
            ],
          ),
        );
      } else if (state.trailingIcon != null) {
        return Padding(
          padding: const EdgeInsetsDirectional.only(end: 16.0),
          child: GestureDetector(
            onTap: state.obscureText ? viewModel.toggleObscureText : null,
            child: SizedBox(
              width: 18.0,
              height: 18.0,
              child: Icon(
                state.trailingIcon!,
                size: 18.0,
              ),
            ),
          ),
        );
      }
    }
    return null;
  }
}
