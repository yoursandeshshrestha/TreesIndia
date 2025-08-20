import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/theming/text_styles.dart';

class OtpTextfieldWidget extends StatefulWidget {
  final Function(String) onCompleted;
  final Function(String)? onChanged;
  final int length;
  final bool obscureText;
  final bool enabled;

  const OtpTextfieldWidget({
    super.key,
    required this.onCompleted,
    this.onChanged,
    this.length = 4,
    this.obscureText = false,
    this.enabled = true,
  });

  @override
  State<OtpTextfieldWidget> createState() => _OtpTextfieldWidgetState();
}

class _OtpTextfieldWidgetState extends State<OtpTextfieldWidget> {
  late List<TextEditingController> controllers;
  late List<FocusNode> focusNodes;
  String currentOtp = '';

  @override
  void initState() {
    super.initState();
    controllers =
        List.generate(widget.length, (index) => TextEditingController());
    focusNodes = List.generate(widget.length, (index) => FocusNode());
  }

  @override
  void dispose() {
    for (var controller in controllers) {
      controller.dispose();
    }
    for (var focusNode in focusNodes) {
      focusNode.dispose();
    }
    super.dispose();
  }

  void _onTextChanged(String value, int index) {
    if (value.isNotEmpty) {
      if (index < widget.length - 1) {
        focusNodes[index + 1].requestFocus();
      } else {
        focusNodes[index].unfocus();
      }
    }

    // Build current OTP
    currentOtp = '';
    for (var controller in controllers) {
      currentOtp += controller.text;
    }

    widget.onChanged?.call(currentOtp);

    if (currentOtp.length == widget.length) {
      widget.onCompleted(currentOtp);
    }
  }

  void _onKeyEvent(KeyEvent event, int index) {
    if (event is KeyDownEvent &&
        event.logicalKey == LogicalKeyboardKey.backspace) {
      if (controllers[index].text.isEmpty && index > 0) {
        focusNodes[index - 1].requestFocus();
        controllers[index - 1].clear();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final totalGaps = widget.length - 1;
    final fieldWidth = (screenWidth - 48 - (totalGaps * 12)) / widget.length;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(widget.length, (index) {
        return SizedBox(
          width: fieldWidth,
          height: 64,
          child: KeyboardListener(
            focusNode: FocusNode(),
            onKeyEvent: (event) => _onKeyEvent(event, index),
            child: TextFormField(
              controller: controllers[index],
              focusNode: focusNodes[index],
              enabled: widget.enabled,
              textAlign: TextAlign.center,
              keyboardType: TextInputType.number,
              obscureText: widget.obscureText,
              maxLength: 1,
              style: TextStyles.h3Bold(
                color: widget.enabled
                    ? AppColors.brandNeutral900
                    : AppColors.brandNeutral500,
              ),
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(1),
              ],
              decoration: InputDecoration(
                counterText: '',
                filled: true,
                fillColor: widget.enabled
                    ? Colors.transparent
                    : AppColors.brandNeutral100,
                contentPadding: const EdgeInsets.symmetric(
                  vertical: 12.0,
                  horizontal: 8.0,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: const BorderSide(
                    color: AppColors.brandNeutral200,
                    width: 1.0,
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: BorderSide(
                    color: controllers[index].text.isNotEmpty
                        ? AppColors.brandPrimary600
                        : AppColors.brandNeutral200,
                    width: 1.0,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: const BorderSide(
                    color: AppColors.brandPrimary600,
                    width: 1.0,
                  ),
                ),
                disabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: const BorderSide(
                    color: AppColors.brandNeutral200,
                    width: 1.0,
                  ),
                ),
              ),
              onChanged: (value) => _onTextChanged(value, index),
              onTapOutside: (_) => FocusScope.of(context).unfocus(),
            ),
          ),
        );
      }),
    );
  }
}
