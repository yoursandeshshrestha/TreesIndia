import 'package:flutter/material.dart';

class WalkthroughPositionState {
  final Offset widgetPosition;
  final Size widgetSize;

  WalkthroughPositionState({
    required this.widgetPosition,
    required this.widgetSize,
  });

  factory WalkthroughPositionState.initial() {
    return WalkthroughPositionState(
      widgetPosition: Offset.zero,
      widgetSize: Size.zero,
    );
  }
}
