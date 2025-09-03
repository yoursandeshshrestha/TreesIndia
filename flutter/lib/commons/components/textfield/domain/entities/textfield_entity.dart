import 'package:trees_india/commons/components/textfield/domain/entities/helper_message_entity.dart';
import 'package:trees_india/commons/components/textfield/domain/entities/validation_message_entity.dart';
import 'package:flutter/services.dart';
import 'package:flutter/material.dart';

class TextFieldEntity {
  final String text;
  final bool obscureText;
  final bool hasClearTextButton;
  final IconData? leadingIcon;
  final double? leadingIconSize;
  final IconData? trailingIcon;
  final List<HelperMessage>? helperMessages;
  final List<ValidationMessage> validationMessages;
  final bool isDirty;
  final List<TextInputFormatter>? inputFormatters;
  final TextInputType keyboardType;
  final bool isAllowedSpaces;
  final bool hasError;
  final TextCapitalization textCapitalization;

  TextFieldEntity({
    this.text = '',
    this.obscureText = false,
    this.hasClearTextButton = false,
    this.leadingIcon,
    this.trailingIcon,
    this.helperMessages = const [],
    this.validationMessages = const [],
    this.isDirty = false,
    this.leadingIconSize = 16.0,
    this.inputFormatters = const [],
    this.keyboardType = TextInputType.text,
    this.isAllowedSpaces = true,
    this.hasError = false,
    this.textCapitalization = TextCapitalization.none,
  });

  TextFieldEntity copyWith({
    String? text,
    bool? obscureText,
    bool? hasClearTextButton,
    IconData? leadingIcon,
    IconData? trailingIcon,
    List<HelperMessage>? helperMessages,
    List<ValidationMessage>? validationMessages,
    bool? isDirty,
    double? leadingIconSize,
    List<TextInputFormatter>? inputFormatters,
    TextInputType? keyboardType,
    bool? isAllowedSpaces,
    bool? hasError,
    TextCapitalization? textCapitalization,
  }) {
    return TextFieldEntity(
      text: text ?? this.text,
      obscureText: obscureText ?? this.obscureText,
      hasClearTextButton: hasClearTextButton ?? this.hasClearTextButton,
      leadingIcon: leadingIcon ?? this.leadingIcon,
      trailingIcon: trailingIcon ?? this.trailingIcon,
      helperMessages: helperMessages ?? this.helperMessages,
      validationMessages: validationMessages ?? this.validationMessages,
      isDirty: isDirty ?? this.isDirty,
      leadingIconSize: leadingIconSize ?? this.leadingIconSize,
      inputFormatters: inputFormatters ?? this.inputFormatters,
      keyboardType: keyboardType ?? this.keyboardType,
      isAllowedSpaces: isAllowedSpaces ?? this.isAllowedSpaces,
      hasError: hasError ?? this.hasError,
      textCapitalization: textCapitalization ?? this.textCapitalization,
    );
  }
}
