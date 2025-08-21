import 'dart:ui';
import 'package:trees_india/commons/constants/bottom_sheet_constants.dart';
import 'package:flutter/material.dart';

void openCustomBottomSheet({
  required BuildContext context,
  required Widget child,
  bool enableSwipeDownToClose = false,
  bool enableTapToClose = true,
  Color bottomSheetColor = Colors.white,
  bool isFlexible = true,
  bool applySafeHeightConstraint = false, // New optional parameter
}) {
  Navigator.of(context).push(
    PageRouteBuilder(
      opaque: false,
      transitionDuration: BottomSheetConstants.bottomSheetTransitionDuration,
      pageBuilder: (BuildContext context, Animation<double> animation,
          Animation<double> secondaryAnimation) {
        return Scaffold(
          backgroundColor: Colors.transparent,
          resizeToAvoidBottomInset: false,
          body: Stack(
            children: [
              Positioned.fill(
                child: GestureDetector(
                  onTap: enableTapToClose
                      ? () => Navigator.of(context).pop()
                      : null,
                  child: ClipRect(
                    child: BackdropFilter(
                      filter: ImageFilter.blur(
                        sigmaX: BottomSheetConstants.bottomSheetBlurSigma,
                        sigmaY: BottomSheetConstants.bottomSheetBlurSigma,
                      ),
                      child: Container(
                        color: BottomSheetConstants.bottomSheetBackgroundColor,
                      ),
                    ),
                  ),
                ),
              ),
              GestureDetector(
                onVerticalDragUpdate: enableSwipeDownToClose
                    ? (details) {
                        if (details.primaryDelta! > 5) {
                          Navigator.of(context).pop();
                        }
                      }
                    : null,
                child: Align(
                  alignment: Alignment.bottomCenter,
                  child: SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(0, 1),
                      end: Offset.zero,
                    ).animate(CurvedAnimation(
                      parent: animation,
                      curve: Curves.easeOut,
                    )),
                    child: Container(
                      decoration: BoxDecoration(
                        color: bottomSheetColor,
                        borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(16.0),
                        ),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Center(
                            child: Padding(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 12.0),
                              child: Container(
                                width: 80.0,
                                height: 6.0,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFc5c5c5),
                                  borderRadius: BorderRadius.circular(80.0),
                                ),
                              ),
                            ),
                          ),
                          if (isFlexible)
                            applySafeHeightConstraint
                                ? SafeArea(
                                    child: ConstrainedBox(
                                      constraints: BoxConstraints(
                                        maxHeight:
                                            MediaQuery.of(context).size.height *
                                                0.8,
                                      ),
                                      child: SingleChildScrollView(
                                        padding: EdgeInsets.only(
                                          bottom: MediaQuery.of(context)
                                              .viewInsets
                                              .bottom,
                                        ),
                                        child: Column(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            child,
                                            const SizedBox(height: 34.0),
                                          ],
                                        ),
                                      ),
                                    ),
                                  )
                                : Flexible(
                                    child: SingleChildScrollView(
                                      padding: EdgeInsets.only(
                                        bottom: MediaQuery.of(context)
                                            .viewInsets
                                            .bottom,
                                      ),
                                      child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          child,
                                          const SizedBox(height: 34.0),
                                        ],
                                      ),
                                    ),
                                  )
                          else ...[
                            child,
                            const SizedBox(height: 34.0),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    ),
  );
}
