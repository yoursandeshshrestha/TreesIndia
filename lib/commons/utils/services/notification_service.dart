import 'package:flutter/material.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/error_snackbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/info_snackbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/success_snackbar_widget.dart';
import 'package:trees_india/commons/components/snackbar/app/views/warning_snackbar_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/utils/open_custom_bottom_sheet.dart';

class NotificationService {
  final GlobalKey<ScaffoldMessengerState> _scaffoldMessengerKey =
      GlobalKey<ScaffoldMessengerState>();
  bool _isOfflineSheetShowing = false;

  GlobalKey<ScaffoldMessengerState> get scaffoldMessengerKey =>
      _scaffoldMessengerKey;

  void showErrorSnackBar(
    String message, {
    IconData? icon,
    bool isDismissible = true,
    Duration? duration,
    Key? key,
    EdgeInsets? margin,
    EdgeInsets? padding,
  }) {
    _scaffoldMessengerKey.currentState?.showSnackBar(
      ErrorSnackbarWidget(
        message: message,
        icon: icon,
        isDismissible: isDismissible,
        duration: duration ?? const Duration(seconds: 2),
        key: key,
        margin: margin ?? const EdgeInsets.all(16),
        padding:
            padding ?? const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      ).createSnackBar(),
    );
  }

  void showSuccessSnackBar(
    String message, {
    IconData? icon,
    bool isDismissible = true,
    Duration? duration,
    Key? key,
    EdgeInsets? margin,
    EdgeInsets? padding,
  }) {
    _scaffoldMessengerKey.currentState?.showSnackBar(
      SuccessSnackbarWidget(
        message: message,
        icon: icon,
        isDismissible: isDismissible,
        duration: duration ?? const Duration(seconds: 3),
        key: key,
        margin: margin ?? const EdgeInsets.all(16),
        padding:
            padding ?? const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      ).createSnackBar(),
    );
  }

  void showInfoSnackBar(
    String message, {
    IconData? icon,
    bool isDismissible = true,
    Duration? duration,
    Key? key,
    EdgeInsets? margin,
    EdgeInsets? padding,
  }) {
    _scaffoldMessengerKey.currentState?.showSnackBar(
      InfoSnackbarWidget(
        message: message,
        icon: icon,
        isDismissible: isDismissible,
        duration: duration ?? const Duration(seconds: 2),
        key: key,
        margin: margin ?? const EdgeInsets.all(16),
        padding:
            padding ?? const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      ).createSnackBar(),
    );
  }

  void showWarningSnackBar(
    String message, {
    IconData? icon,
    bool isDismissible = true,
    Duration? duration,
    Key? key,
    EdgeInsets? margin,
    EdgeInsets? padding,
  }) {
    _scaffoldMessengerKey.currentState?.showSnackBar(
      WarningSnackbarWidget(
        message: message,
        icon: icon,
        isDismissible: isDismissible,
        duration: duration ?? const Duration(seconds: 2),
        key: key,
        margin: margin ?? const EdgeInsets.all(16),
        padding:
            padding ?? const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      ).createSnackBar(),
    );
  }

  void showDownloadingSnackBar(
    String message, {
    IconData? icon,
    bool isDismissible = true,
    Duration? duration,
    Key? key,
    EdgeInsets? margin,
    EdgeInsets? padding,
  }) {
    _scaffoldMessengerKey.currentState?.showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor:
                    AlwaysStoppedAnimation<Color>(AppColors.brandPrimary700),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: B3Regular(text: message, color: AppColors.brandPrimary700),
            ),
          ],
        ),
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.brandPrimary100,
        duration: duration ?? const Duration(seconds: 2),
        margin: margin ?? const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppColors.brandPrimary700, width: 1),
        ),
        padding:
            padding ?? const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        dismissDirection:
            isDismissible ? DismissDirection.horizontal : DismissDirection.none,
      ),
    );
  }

  // New method to show offline state
  void showOfflineMessage(BuildContext context, {VoidCallback? onRetry}) {
    if (_isOfflineSheetShowing) return;
    _isOfflineSheetShowing = true;

    openCustomBottomSheet(
      context: context,
      enableTapToClose: false,
      enableSwipeDownToClose: false,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 9.0),
            // SizedBox(
            //   height: 125.0,
            //   child: SvgPicture.asset(AppImages.offlineIcon),
            // ),
            const SizedBox(height: 25.0),
            H2Medium(
              text: 'You are offline',
            ),
            B3Medium(
              text: "Check your internet connection and try again.",
            ),
            const SizedBox(height: 40.0),
            SizedBox(
              width: double.maxFinite,
              child: SolidButtonWidget(
                label: 'Okay',
                onPressed: () {
                  Navigator.of(context).pop();
                  _isOfflineSheetShowing = false;
                  if (onRetry != null) {
                    onRetry();
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Method to hide offline message if it's showing
  void hideOfflineMessage(BuildContext context) {
    if (_isOfflineSheetShowing && Navigator.canPop(context)) {
      Navigator.of(context).pop();
      _isOfflineSheetShowing = false;
    }
  }

  // Getter to check if offline message is showing
  bool get isOfflineMessageShowing => _isOfflineSheetShowing;
}
