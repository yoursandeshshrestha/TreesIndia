import 'package:trees_india/commons/components/button/domain/entities/button_entity.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:flutter/material.dart';

abstract class BaseButtonWidget extends StatelessWidget {
  final ButtonEntity entity;
  final VoidCallback? onPressed;
  final bool isLoading;

  const BaseButtonWidget({
    required this.entity,
    required this.onPressed,
    this.isLoading = false,
    super.key,
  });

  Widget buildButtonContent(BuildContext context);

  @override
  Widget build(BuildContext context) {
    return buildButtonContent(context);
  }

  Widget buildIcon() {
    return entity.icon != null
        ? Icon(
            entity.icon!,
            color: entity.iconColor,
          )
        : const SizedBox.shrink();
  }

  Widget buildLabel() {
    return H4Medium(
      text: entity.label!,
      color: entity.labelColor,
    );
  }

  Widget buildLoadingIndicator({Color? color}) {
    return SizedBox(
      width: 20,
      height: 20,
      child: CircularProgressIndicator(
        strokeWidth: 2,
        valueColor: AlwaysStoppedAnimation<Color>(
          color ?? entity.labelColor ?? Colors.white,
        ),
      ),
    );
  }
}
