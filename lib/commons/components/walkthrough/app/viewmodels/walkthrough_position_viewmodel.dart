import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/walkthrough/app/viewmodels/walkthrough_position_state.dart';

class WalkthroughPositionViewModel
    extends StateNotifier<WalkthroughPositionState>
    with ResettableNotifier<WalkthroughPositionState> {
  WalkthroughPositionViewModel() : super(WalkthroughPositionState.initial());

  void calculateWidgetPosition(GlobalKey highlightedKey) {
    // Ensure the widget has been rendered before calculating position
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Wait for the layout to settle down using Future.delayed
      Future.delayed(const Duration(milliseconds: 100), () {
        final renderBox =
            highlightedKey.currentContext?.findRenderObject() as RenderBox?;

        if (renderBox != null && renderBox.hasSize) {
          final size = renderBox.size;
          final position = renderBox.localToGlobal(Offset.zero);

          // Get padding/insets (safe area)
          final mediaQuery = MediaQuery.of(highlightedKey.currentContext!);
          final screenHeight = mediaQuery.size.height;

          // Adjust position considering the device's top padding (status bar, notch)
          final adjustedPosition =
              position.translate(0, -(mediaQuery.padding.top + 24));

          // Ensure the widget stays within the screen bounds
          final widgetTopPosition = adjustedPosition.dy;
          final widgetBottomPosition = widgetTopPosition + size.height;

          // If the widget goes off the bottom of the screen, adjust the position
          if (widgetBottomPosition > screenHeight) {
            state = WalkthroughPositionState(
              widgetPosition:
                  Offset(adjustedPosition.dx, screenHeight - size.height - 16),
              widgetSize: size,
            );
          } else {
            state = WalkthroughPositionState(
              widgetPosition: adjustedPosition,
              widgetSize: size,
            );
          }
        } else {
          print('RenderBox is not ready yet.');
        }
      });
    });
  }

  @override
  void reset() {
    state = WalkthroughPositionState.initial();
  }
}
