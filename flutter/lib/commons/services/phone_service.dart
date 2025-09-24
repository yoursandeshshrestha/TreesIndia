import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class PhoneService {
  static const String _phoneUrlPrefix = 'tel:';

  /// Initiates a phone call to the specified phone number
  /// Returns true if the call was initiated successfully, false otherwise
  static Future<bool> makePhoneCall(String phoneNumber) async {
    try {
      // Clean the phone number - remove any non-digit characters except +
      String cleanNumber = phoneNumber.replaceAll(RegExp(r'[^\d+]'), '');

      // Ensure the phone number starts with + for international format
      if (!cleanNumber.startsWith('+')) {
        // If it doesn't start with +, assume it's an Indian number and add +91
        if (cleanNumber.length == 10) {
          cleanNumber = '+91$cleanNumber';
        } else if (cleanNumber.length == 12 && cleanNumber.startsWith('91')) {
          cleanNumber = '+$cleanNumber';
        }
      }

      final Uri phoneUri = Uri.parse('$_phoneUrlPrefix$cleanNumber');

      // Check if we can launch the URL
      bool canLaunch = false;
      try {
        canLaunch = await canLaunchUrl(phoneUri);
      } catch (e) {
        debugPrint('Error checking if URL can be launched: $e');
        // If canLaunchUrl fails, try to launch directly
        try {
          await launchUrl(phoneUri);
          return true;
        } catch (launchError) {
          debugPrint('Error launching URL directly: $launchError');
          return false;
        }
      }

      if (canLaunch) {
        await launchUrl(phoneUri);
        return true;
      } else {
        debugPrint('Cannot launch phone call to: $cleanNumber');
        return false;
      }
    } catch (e) {
      debugPrint('Error making phone call: $e');
      // Check if it's a MissingPluginException
      if (e.toString().contains('MissingPluginException')) {
        debugPrint(
            'This error usually occurs when running on simulator/emulator or when plugin is not properly installed');
        debugPrint('Please test on a real device for phone call functionality');
      }
      return false;
    }
  }

  /// Shows a dialog to confirm phone call action

  /// Validates if a phone number is in a valid format
  static bool isValidPhoneNumber(String phoneNumber) {
    // Remove all non-digit characters except +
    String cleanNumber = phoneNumber.replaceAll(RegExp(r'[^\d+]'), '');

    // Check if it's a valid format (10 digits for local, 12+ for international)
    return cleanNumber.length >= 10 && cleanNumber.length <= 15;
  }

  /// Formats phone number for display
  static String formatPhoneNumber(String phoneNumber) {
    String cleanNumber = phoneNumber.replaceAll(RegExp(r'[^\d+]'), '');

    // If it's an Indian number with country code
    if (cleanNumber.startsWith('+91') && cleanNumber.length == 13) {
      return '+91 ${cleanNumber.substring(3, 8)} ${cleanNumber.substring(8)}';
    }
    // If it's a 10-digit Indian number
    else if (cleanNumber.length == 10) {
      return '+91 ${cleanNumber.substring(0, 5)} ${cleanNumber.substring(5)}';
    }
    // For other international numbers, just return as is
    else {
      return phoneNumber;
    }
  }
}
