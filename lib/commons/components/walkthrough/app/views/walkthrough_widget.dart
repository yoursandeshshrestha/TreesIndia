import 'dart:ui';
import 'package:trees_india/commons/components/backdrop_loader/app/views/backdrop_loader.dart';
import 'package:trees_india/commons/constants/enums.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/walkthrough_position_provider.dart';
import '../providers/walkthrough_provider.dart';

class TrianglePointer extends StatelessWidget {
  final bool isAbove; // Determines whether the pointer is above or below
  final Color color; // Color of the triangle

  const TrianglePointer({
    super.key,
    required this.isAbove,
    this.color = const Color(0xFFFFF6F1), // Default color if not provided
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: const Size(12, 12), // Updated size to 12x12
      painter: TrianglePainter(isAbove: isAbove, color: color),
    );
  }
}

class TrianglePainter extends CustomPainter {
  final bool isAbove; // Determines if the triangle is above or below
  final Color color; // Color of the triangle

  TrianglePainter({required this.isAbove, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color // Use the passed color
      ..style = PaintingStyle.fill;

    final path = Path();

    if (isAbove) {
      path.moveTo(0, 0);
      path.lineTo(size.width / 2, size.height);
      path.lineTo(size.width, 0);
      path.close();
    } else {
      path.moveTo(0, size.height);
      path.lineTo(size.width / 2, 0);
      path.lineTo(size.width, size.height);
      path.close();
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return false;
  }
}

class WalkthroughWidget extends ConsumerStatefulWidget {
  final List<GlobalKey> highlightedKeys;
  final List<Widget> customWalkthroughWidgets;
  final List<Widget> highlightedWidgets;
  final String pageKey;
  final List<bool> isAbove;
  final Color triangleColor;
  final double customWalkthroughWidgetWidth;
  final bool isMultiStep;
  final List<PositionAlignment> positionAlignment;
  final List<PositionAlignment> pointerAlignment;

  const WalkthroughWidget({
    super.key,
    required this.highlightedKeys,
    required this.customWalkthroughWidgets,
    required this.highlightedWidgets,
    required this.pageKey,
    this.isAbove = const [false],
    this.triangleColor = const Color(0xFFFFF6F1),
    required this.customWalkthroughWidgetWidth,
    this.isMultiStep = false,
    this.positionAlignment = const [PositionAlignment.defaultPosition],
    this.pointerAlignment = const [PositionAlignment.defaultPosition],
  });

  @override
  ConsumerState<WalkthroughWidget> createState() => _WalkthroughWidgetState();
}

class _WalkthroughWidgetState extends ConsumerState<WalkthroughWidget> {
  final GlobalKey _walkthroughWidgetKey = GlobalKey();
  int _lastCalculatedStep = -1;

  @override
  void didUpdateWidget(WalkthroughWidget oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (widget.pageKey != oldWidget.pageKey || _shouldRecalculatePosition()) {
      _calculateCurrentWidgetPosition();
    }
  }

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      Future.delayed(const Duration(milliseconds: 100), () {
        if (!mounted) return;
        ref
            .read(walkthroughViewModelProvider.notifier)
            .loadWalkthroughStatus(widget.pageKey);
        _calculateCurrentWidgetPosition();
      });
    });
  }

  bool _shouldRecalculatePosition() {
    final currentStep = ref.watch(walkthroughViewModelProvider).maybeWhen(
          data: (entity) => entity.currentStep,
          orElse: () => 0,
        );

    if (currentStep != _lastCalculatedStep) {
      _lastCalculatedStep = currentStep; // Update the last calculated step
      return true;
    }
    return false;
  }

  void _calculateCurrentWidgetPosition() {
    // Get the current step from the provider
    final currentStep = ref.watch(walkthroughViewModelProvider).maybeWhen(
          data: (entity) => entity.currentStep,
          orElse: () => 0,
        );

    // Ensure the correct key is calculated based on the current step
    final currentKey = widget.isMultiStep
        ? widget.highlightedKeys[currentStep]
        : widget.highlightedKeys.first;

    // Recalculate widget position for the current highlighted widget
    ref
        .read(walkthroughPositionProvider.notifier)
        .calculateWidgetPosition(currentKey);
  }

  @override
  Widget build(BuildContext context) {
    final walkthroughState = ref.watch(walkthroughViewModelProvider);
    final positionState = ref.watch(walkthroughPositionProvider);

    return walkthroughState.when(
      data: (walkthroughManagerEntity) {
        if (walkthroughManagerEntity.isCompleted) {
          return const SizedBox.shrink(); // Hide if completed
        }

        final currentStep = walkthroughManagerEntity.currentStep;

        if (_shouldRecalculatePosition()) {
          _calculateCurrentWidgetPosition(); // Ensure position recalculates when step changes
        }

        // final GlobalKey currentKey = widget.isMultiStep
        //     ? widget.highlightedKeys[currentStep]
        //     : widget.highlightedKeys.first;

        final Widget currentWalkthroughWidget = widget.isMultiStep
            ? widget.customWalkthroughWidgets[currentStep]
            : widget.customWalkthroughWidgets.first;

        final Widget currentHighlightedWidget = widget.isMultiStep
            ? widget.highlightedWidgets[currentStep]
            : widget.highlightedWidgets.first;

        final isAboveForCurrentStep = widget.isMultiStep
            ? widget.isAbove[currentStep]
            : widget.isAbove.first;

        final PositionAlignment widgetAlignmentForCurrentStep =
            widget.isMultiStep
                ? widget.positionAlignment[currentStep]
                : widget.positionAlignment.first;

        final PositionAlignment pointerAlignmentForCurrentStep =
            widget.isMultiStep
                ? widget.pointerAlignment[currentStep]
                : widget.pointerAlignment.first;

        final screenHeight = MediaQuery.of(context).size.height;
        final double walkthroughWidgetHeight = _getWalkthroughWidgetHeight();
        double walkthroughTopPosition;
        double pointerTopPosition;

        // Adjust position based on screen height
        if (isAboveForCurrentStep) {
          if (positionState.widgetPosition.dy - walkthroughWidgetHeight - 12 <
              0) {
            walkthroughTopPosition = positionState.widgetPosition.dy +
                positionState.widgetSize.height +
                12;
            pointerTopPosition = positionState.widgetPosition.dy +
                positionState.widgetSize.height;
          } else {
            walkthroughTopPosition =
                positionState.widgetPosition.dy - walkthroughWidgetHeight - 12;
            pointerTopPosition = positionState.widgetPosition.dy - 12;
          }
        } else {
          if (positionState.widgetPosition.dy +
                  positionState.widgetSize.height +
                  walkthroughWidgetHeight +
                  12 >
              screenHeight) {
            walkthroughTopPosition =
                positionState.widgetPosition.dy - walkthroughWidgetHeight - 12;
            pointerTopPosition = positionState.widgetPosition.dy - 12;
          } else {
            walkthroughTopPosition = positionState.widgetPosition.dy +
                positionState.widgetSize.height +
                12;
            pointerTopPosition = positionState.widgetPosition.dy +
                positionState.widgetSize.height;
          }
        }

        // Determine the 'left' position based on the alignment value
        double widgetLeftPosition;
        switch (widgetAlignmentForCurrentStep) {
          case PositionAlignment.start:
            widgetLeftPosition = positionState.widgetPosition.dx;
            break;
          case PositionAlignment.end:
            widgetLeftPosition = positionState.widgetPosition.dx +
                positionState.widgetSize.width -
                widget.customWalkthroughWidgetWidth;
            break;
          case PositionAlignment.defaultPosition: // Center (default)
            widgetLeftPosition = (MediaQuery.of(context).size.width -
                    widget.customWalkthroughWidgetWidth) /
                2;
            break;
        }

        double pointerLeftPosition;
        switch (pointerAlignmentForCurrentStep) {
          case PositionAlignment.start:
            pointerLeftPosition = positionState.widgetPosition.dx + 16;
            break;
          case PositionAlignment.end:
            pointerLeftPosition = positionState.widgetPosition.dx +
                positionState.widgetSize.width -
                24;
            break;
          case PositionAlignment.defaultPosition: // Center (default)
            pointerLeftPosition = positionState.widgetPosition.dx +
                positionState.widgetSize.width / 2 -
                6;
            break;
        }

        return Stack(
          children: [
            // Blurred background
            BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 3, sigmaY: 3),
              child: Container(color: const Color(0xff1c1c1e).withValues(alpha: 0.6)),
            ),
            // Highlight the specific widget with a border
            Positioned(
              top: positionState.widgetPosition.dy - 24,
              left: positionState.widgetPosition.dx,
              width: positionState.widgetSize.width,
              height: positionState.widgetSize.height,
              child: currentHighlightedWidget,
            ),
            // Position the triangle pointer
            Positioned(
              top: isAboveForCurrentStep
                  ? pointerTopPosition - 4 - 24
                  : pointerTopPosition + 4 - 24,
              left: pointerLeftPosition,
              child: TrianglePointer(
                isAbove: isAboveForCurrentStep,
                color: widget.triangleColor,
              ),
            ),
            // Custom walkthrough UI positioned either above or below the highlighted widget
            Positioned(
              key: _walkthroughWidgetKey,
              top: isAboveForCurrentStep
                  ? walkthroughTopPosition - 4 - 24
                  : walkthroughTopPosition + 4 - 24,
              left: widgetLeftPosition,
              child: currentWalkthroughWidget,
            ),
          ],
        );
      },
      loading: () {
        return const BackdropLoader();
      },
      error: (error, stackTrace) {
        print("Error in WalkthroughWidget: $error");
        return const Text('Error loading walkthrough');
      },
    );
  }

  double _getWalkthroughWidgetHeight() {
    final RenderBox? renderBox =
        _walkthroughWidgetKey.currentContext?.findRenderObject() as RenderBox?;
    return renderBox?.size.height ?? 0.0;
  }
}
