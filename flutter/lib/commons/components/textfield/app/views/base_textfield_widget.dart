import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/components/textfield/app/viewmodels/base_textfield_viewmodel.dart';
import 'package:trees_india/commons/components/textfield/app/viewmodels/password_textfield_viewmodel.dart';
import 'package:trees_india/commons/components/textfield/domain/entities/helper_message_entity.dart';
import 'package:trees_india/commons/components/textfield/domain/entities/textfield_entity.dart';
import 'package:trees_india/commons/components/textfield/domain/entities/validation_message_entity.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/theming/text_styles.dart';

abstract class BaseTextfieldWidget extends StatefulWidget {
  final String hintText;
  final ValueChanged<String> onTextChanged;
  final ValueChanged<String>? onBlurred;
  final ValueChanged<String>? onSubmitted;
  final ValueChanged<String>? onFocused;
  final FocusNode? focusNode;
  final bool enabled;
  final bool readOnly;
  final bool hasError;

  const BaseTextfieldWidget({
    super.key,
    required this.hintText,
    required this.onTextChanged,
    this.onBlurred,
    this.onSubmitted,
    this.onFocused,
    this.focusNode,
    this.enabled = true,
    this.readOnly = false,
    this.hasError = false,
  });

  @override
  BaseTextfieldWidgetState<BaseTextfieldWidget> createState();
}

abstract class BaseTextfieldWidgetState<T extends BaseTextfieldWidget>
    extends State<T> {
  late TextEditingController controller;
  late BaseTextFieldViewModel viewModel;

  late FocusNode _focusNode;
  bool _ownsFocusNode = false;

  /// Subclasses must supply their own VM
  BaseTextFieldViewModel createViewModel();

  @override
  void initState() {
    super.initState();

    // ViewModel + controller
    viewModel = createViewModel();
    controller = TextEditingController(text: viewModel.value.text);

    // VM → controller
    viewModel.addListener(() {
      final newText = viewModel.value.text;
      if (controller.text != newText) {
        final sel = controller.selection;
        controller.text = newText;
        if (sel.baseOffset <= newText.length) {
          controller.selection = sel;
        } else {
          controller.selection =
              TextSelection.collapsed(offset: newText.length);
        }
      }
      setState(() {});
    });

    // controller → VM & onTextChanged
    controller.addListener(() {
      if (viewModel.value.text != controller.text) {
        viewModel.updateText(controller.text);
        widget.onTextChanged(controller.text);
      }
    });

    // FocusNode: use provided or own
    if (widget.focusNode != null) {
      _focusNode = widget.focusNode!;
    } else {
      _focusNode = FocusNode();
      _ownsFocusNode = true;
    }
    _focusNode.addListener(_handleFocusChange);
  }

  void _handleFocusChange() {
    if (_focusNode.hasFocus) {
      widget.onFocused?.call(controller.text);
    } else {
      viewModel.markDirty();
      widget.onBlurred?.call(controller.text);
    }
    setState(() {}); // rebuild to re-evaluate showValidation
  }

  @override
  void dispose() {
    _focusNode.removeListener(_handleFocusChange);
    if (_ownsFocusNode) _focusNode.dispose();
    controller.dispose();
    viewModel.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<TextFieldEntity>(
      valueListenable: viewModel,
      builder: (context, state, child) {
        // show validation once dirty AND (blurred OR has text while focused)
        final showValidation =
            state.isDirty && (!_focusNode.hasFocus || state.text.isNotEmpty);

        final validationMessages = showValidation
            ? viewModel.validateText(state, context)
            : <ValidationMessage>[];

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            buildTextField(state, validationMessages, context),
            const SizedBox(height: 8.0),
            if (validationMessages.isNotEmpty)
              buildValidationMessages(validationMessages),
          ],
        );
      },
    );
  }

  Widget buildTextField(TextFieldEntity state,
      List<ValidationMessage> validationMessages, BuildContext context) {
    final isPasswordField = viewModel is PasswordTextFieldViewModel;

    return SizedBox(
      width: double.infinity,
      child: TextFormField(
        controller: controller,
        focusNode: _focusNode,
        keyboardType: state.keyboardType,
        obscureText: state.obscureText,
        enabled: widget.enabled,
        readOnly: widget.readOnly,
        inputFormatters: state.inputFormatters,
        style: TextStyles.b3Medium(
          color: widget.enabled
              ? AppColors.brandNeutral900
              : AppColors.brandNeutral500,
        ),
        decoration: InputDecoration(
          filled: true,
          fillColor:
              !widget.enabled ? AppColors.brandNeutral100 : Colors.transparent,
          isCollapsed: true,
          contentPadding: const EdgeInsets.symmetric(
            vertical: 12.0,
            horizontal: 16.0,
          ),
          hintText: widget.hintText,
          hintStyle: TextStyles.b3Medium(
            color: AppColors.brandNeutral400,
          ),
          prefixIcon: buildLeadingIcon(state),
          prefixIconConstraints:
              const BoxConstraints(maxHeight: 18.0, maxWidth: 60.0),
          suffixIcon: buildTrailingIcon(state, context),
          suffixIconConstraints:
              const BoxConstraints(maxHeight: 18.0, maxWidth: 60.0),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide:
                const BorderSide(color: AppColors.brandNeutral200, width: 1.0),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide: BorderSide(
              color: (validationMessages.isNotEmpty && !isPasswordField) ||
                      widget.hasError
                  ? AppColors.stateRed400
                  : viewModel.isValid(state.text, context)
                      ? AppColors.brandNeutral400
                      : AppColors.brandNeutral200,
              width: 1.0,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide: BorderSide(
              color: isPasswordField
                  ? (viewModel.isValid(state.text, context) ||
                          state.text.isEmpty
                      ? const Color(0xFF055c3a) // Main app color
                      : AppColors.stateRed400)
                  : (validationMessages.isNotEmpty
                      ? AppColors.stateRed400
                      : const Color(0xFF055c3a)), // Main app color
              width: 1.0,
            ),
          ),
          disabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8.0),
            borderSide:
                const BorderSide(color: AppColors.brandNeutral200, width: 1.0),
          ),
        ),
        onChanged: (text) {
          viewModel.updateText(text);
          widget.onTextChanged(text);
        },
        onFieldSubmitted: (text) {
          widget.onSubmitted?.call(text);
        },
        onTapOutside: (_) => FocusScope.of(context).unfocus(),
      ),
    );
  }

  Widget? buildLeadingIcon(TextFieldEntity state) {
    if (state.leadingIcon != null) {
      return Padding(
        padding: const EdgeInsets.only(right: 8.0),
        child: SizedBox(
          height: 24.0,
          width: 24.0,
          child: Icon(
            state.leadingIcon!,
            color: AppColors.brandNeutral600,
          ),
        ),
      );
    }
    return null;
  }

  Widget? buildTrailingIcon(TextFieldEntity state, BuildContext context) {
    if (state.hasClearTextButton && state.text.isNotEmpty) {
      return IconButton(
        icon: const Icon(Icons.close),
        onPressed: viewModel.clearText,
      );
    } else if (state.trailingIcon != null) {
      return IconButton(
        icon: Icon(state.trailingIcon!),
        onPressed: state.obscureText ? viewModel.toggleObscureText : null,
      );
    }
    return null;
  }

  Widget buildHelperMessages(List<HelperMessage> messages) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: messages.map((m) {
        return Row(
          children: [
            SizedBox(
              height: 16.0,
              width: 16.0,
              child: Icon(
                m.icon,
                color: AppColors.brandNeutral600,
              ),
            ),
            const SizedBox(width: 4.0),
            B4Medium(text: m.message, color: AppColors.brandNeutral600),
          ],
        );
      }).toList(),
    );
  }

  Widget buildValidationMessages(List<ValidationMessage> messages) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < messages.length; i++) ...[
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 16.0,
                width: 16.0,
                child: Icon(
                  messages[i].icon,
                  color: messages[i].color,
                ),
              ),
              const SizedBox(width: 8.0),
              Flexible(
                child: B4Medium(
                  text: messages[i].message,
                  color: messages[i].color,
                  softWrap: true,
                  overflow: TextOverflow.visible,
                ),
              ),
            ],
          ),
          if (i < messages.length - 1) const SizedBox(height: 8.0),
        ],
      ],
    );
  }
}
