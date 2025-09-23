import 'dart:ui';

import 'package:flutter/material.dart';

class DashedBorder extends ShapeBorder {
  final double dashWidth;
  final double dashSpace;
  final Color color;
  final double strokeWidth;
  final BorderRadius borderRadius;

  const DashedBorder({
    this.dashWidth = 5.0,
    this.dashSpace = 3.0,
    required this.color,
    this.strokeWidth = 1.0,
    this.borderRadius = BorderRadius.zero,
  });

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.all(strokeWidth);

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    return Path()..addRRect(borderRadius.toRRect(rect));
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    final RRect rRect = borderRadius.toRRect(rect);
    final Paint paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    final Path path = Path()..addRRect(rRect);
    final PathMetric pathMetric = path.computeMetrics().first;
    final double totalLength = pathMetric.length;

    double distance = 0.0;

    while (distance < totalLength) {
      final double nextDistance = distance + dashWidth;
      canvas.drawPath(
        pathMetric.extractPath(distance, nextDistance),
        paint,
      );
      distance = nextDistance + dashSpace;
    }
  }

  @override
  ShapeBorder scale(double t) => this;

  @override
  ShapeBorder? lerpFrom(ShapeBorder? a, double t) => null;

  @override
  ShapeBorder? lerpTo(ShapeBorder? b, double t) => null;

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) {
    // TODO: implement getInnerPath
    throw UnimplementedError();
  }
}
