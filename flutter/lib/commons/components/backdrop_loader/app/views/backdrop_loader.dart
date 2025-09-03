import 'dart:ui';

import 'package:trees_india/commons/constants/bottom_sheet_constants.dart';
import 'package:flutter/material.dart';

class BackdropLoader extends StatelessWidget {
  const BackdropLoader({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: ClipRect(
            child: BackdropFilter(
              filter: ImageFilter.blur(
                sigmaX: BottomSheetConstants.bottomSheetBlurSigma,
                sigmaY: BottomSheetConstants.bottomSheetBlurSigma,
              ),
              child: Container(
                color: const Color(0xFFFFFFFF).withValues(alpha: 0.2),
              ),
            ),
          ),
        ),
        const CustomLoader(),
      ],
    );
  }
}

class CustomLoader extends StatelessWidget {
  final double width;
  final double height;

  const CustomLoader({
    super.key,
    this.width = 54,
    this.height = 54,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.transparent,
      child: Center(
        child: SizedBox(
          width: width,
          height: height,
          child: const CircularProgressIndicator(),
        ),
      ),
    );
  }
}
