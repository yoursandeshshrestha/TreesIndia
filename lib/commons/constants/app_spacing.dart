import 'package:flutter/material.dart';

class AppSpacing {
  // Base spacing values following 8pt grid system
  static const double xs = 4.0; // Extra small
  static const double sm = 8.0; // Small
  static const double md = 16.0; // Medium
  static const double lg = 24.0; // Large
  static const double xl = 32.0; // Extra large
  static const double xxl = 48.0; // 2X Extra large

  // Common edge insets
  static const EdgeInsetsDirectional defaultPadding =
      EdgeInsetsDirectional.only(start: md, end: md, top: lg, bottom: md);

  static const EdgeInsetsDirectional horizontalPadding =
      EdgeInsetsDirectional.only(start: md, end: md);

  static const EdgeInsetsDirectional verticalPadding =
      EdgeInsetsDirectional.only(top: md, bottom: md);
}
