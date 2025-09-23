import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class CustomExitSnackbar {
  static SnackBar create() {
    return SnackBar(
      content: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(50),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // TreesIndia Logo
            Image.asset(
              'assets/logo/logo.png',
              width: 16,
              height: 16,
            ),
            const SizedBox(width: 12),
            // Exit message text
            const Text(
              'Press back again to exit TreesIndia',
              style: TextStyle(
                color: Colors.black87,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
      backgroundColor: Colors.transparent,
      elevation: 0,
      behavior: SnackBarBehavior.floating,
      duration: const Duration(seconds: 2),
      margin: const EdgeInsets.only(
        bottom: 20,
        left: 40,
        right: 40,
      ),
    );
  }
}
