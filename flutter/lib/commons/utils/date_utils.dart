/// Utility class for date and time operations
/// Handles conversion of dates to Indian Standard Time (IST - UTC+5:30)
class ISTDateUtils {
  // Private constructor to prevent instantiation
  ISTDateUtils._();

  /// Converts a date string to IST (Indian Standard Time - UTC+5:30)
  ///
  /// Accepts various date formats:
  /// - ISO 8601 format: "2025-10-16T20:16:10.381767Z"
  /// - Date strings with timezone offset: "2025-10-16T20:16:10.381767+05:30"
  ///
  /// The function will:
  /// 1. Parse the date string
  /// 2. Convert it to UTC if not already
  /// 3. Add 5 hours 30 minutes to get IST
  ///
  /// Returns a DateTime object in IST
  /// Throws FormatException if the date string is invalid
  static DateTime convertToIST(String dateTimeString) {
    try {
      // Parse the datetime string (handles various formats)
      final parsedDateTime = DateTime.parse(dateTimeString);

      // Convert to IST using the helper method
      return convertToISTFromDateTime(parsedDateTime);
    } catch (e) {
      throw FormatException('Invalid date format: $dateTimeString', e);
    }
  }

  /// Converts a DateTime object to IST (Indian Standard Time - UTC+5:30)
  ///
  /// The function will:
  /// 1. Convert the DateTime to UTC if not already
  /// 2. Add 5 hours 30 minutes to get IST
  ///
  /// Returns a DateTime object in IST
  static DateTime convertToISTFromDateTime(DateTime dateTime) {
    // First convert to UTC to ensure consistency
    final utcDateTime = dateTime.toUtc();

    // Add IST offset (UTC+5:30)
    return utcDateTime.add(const Duration(hours: 5, minutes: 30));
  }

  /// Attempts to convert a date string to IST safely
  /// Returns null if parsing fails instead of throwing an exception
  ///
  /// Useful when you want to gracefully handle invalid dates
  static DateTime? tryConvertToIST(String? dateTimeString) {
    if (dateTimeString == null || dateTimeString.isEmpty) {
      return null;
    }

    try {
      return convertToIST(dateTimeString);
    } catch (e) {
      return null;
    }
  }

  /// Gets the current date and time in IST
  static DateTime nowInIST() {
    return convertToISTFromDateTime(DateTime.now());
  }
}
