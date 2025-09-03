import 'package:flutter/material.dart';

class ButtonEntity {
  final String? label;
  final Color? labelColor;
  final IconData? icon;
  final Color? iconColor;
  final bool isLeadingIcon;
  final bool isEnabled;
  final bool isSolid;
  final bool hasBorder;
  final Color? borderColor;
  final Color? backgroundColor;

  ButtonEntity({
    this.label,
    this.labelColor,
    this.icon,
    this.isLeadingIcon = true,
    this.isEnabled = true,
    this.isSolid = true, // Default to solid button
    this.hasBorder = false, // Default to no border for text buttons
    this.borderColor,
    this.backgroundColor,
    this.iconColor,
  });
}
