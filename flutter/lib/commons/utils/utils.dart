import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:trees_india/commons/utils/file_size_utils.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';

class Utils {
  Future<List<XFile>> pickImages() async {
    final ImagePicker picker = ImagePicker();
    try {
      final List<XFile> images = await picker.pickMultiImage(
        imageQuality: 90,
      );
      return images;
    } catch (e) {
      print('Error picking images: $e');
      return [];
    }
  }

  Future<List<PlatformFile>> pickDocumentsFromDevice({
    bool allowMultiple = true,
    List<String> allowedExtensions = const ['jpg', 'jpeg', 'png', 'pdf', 'mp4','mkv'],
  }) async {
    final fileUtils = FileUtils();

    final result = await FilePicker.platform.pickFiles(
      allowMultiple: allowMultiple,
      type: FileType.custom,
      allowedExtensions: allowedExtensions,
      withData: true,
    );

    if (result != null) {
      final validFiles = <PlatformFile>[];

      for (final file in result.files) {
        final fileSizeMB = fileUtils.getFileSizeInMB(file);
        if (fileSizeMB > FileUtils.maxSizeInMB) {
          throw Exception(
              'File "${file.name}" is ${fileSizeMB.toStringAsFixed(2)}MB. Maximum allowed size is 15MB.');
        }
        validFiles.add(file);
      }
      return validFiles;
    }
    return [];
  }

  static String timeAgo(DateTime time) {
    final now = DateTime.now();
    final difference = now.difference(time);

    if (difference.inMinutes < 60) {
      return "${difference.inMinutes} mins ago";
    } else if (difference.inHours < 24) {
      return "${difference.inHours} hours ago";
    } else if (difference.inDays < 7) {
      return "${difference.inDays} days ago";
    } else {
      return DateFormat('MMM d, yyyy • HH:mm:ss')
          .format(time); // Full formatted time
    }
  }

  static String getInitials(String name) {
    if (name.trim().isEmpty) return "";

    List<String> nameParts =
        name.trim().split(" ").where((part) => part.isNotEmpty).toList();
    if (nameParts.isEmpty) return "";

    String firstInitial = nameParts[0].isNotEmpty ? nameParts[0][0] : "";

    String secondInitial = "";
    if (nameParts.length > 1 && nameParts[1].isNotEmpty) {
      secondInitial = nameParts[1][0];
    } else if (nameParts[0].length > 1) {
      secondInitial = nameParts[0][1];
    }

    return (firstInitial + secondInitial).toUpperCase();
  }

  static Map<String, dynamic> normalizeJson(Map<dynamic, dynamic> json) {
    final Map<String, dynamic> normalized = {};
    json.forEach((key, value) {
      if (value is Map) {
        normalized[key.toString()] = normalizeJson(value);
      } else if (value is List) {
        normalized[key.toString()] = value.map((item) {
          if (item is Map) {
            return normalizeJson(item);
          }
          return item;
        }).toList();
      } else {
        normalized[key.toString()] = value;
      }
    });
    return normalized;
  }

  static String sanitizeFileName(String fileName) {
    // Remove or replace special characters with an underscore
    return fileName.replaceAll(RegExp(r'[^\w\-.]'), '_');
  }

  static String? formatDocumentDateTime(String? dateTimeStr) {
    if (dateTimeStr == null) return null;
    try {
      final date = DateTime.parse(dateTimeStr);
      // Format: "May 23, 2024 • 12:30:24"
      final month = _getMonthName(date.month);
      return '$month ${date.day}, ${date.year} • ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}:${date.second.toString().padLeft(2, '0')}';
    } catch (e) {
      print('Error formatting date: $e');
      return dateTimeStr;
    }
  }

  static String _getMonthName(int month) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    return months[month - 1];
  }

  static Map<String, String> parseUserEmail(String? userEmail) {
    if (userEmail == null || !userEmail.contains(',')) {
      return {'name': '', 'email': ''};
    }
    final parts = userEmail.split(',');
    return {
      'name': parts[0].trim(),
      'email': parts[1].trim(),
    };
  }

  static String formatIPAddress(String? ipAddress) {
    return ipAddress ?? '';
  }

  static Future<Directory> getAppropriateDirectory() async {
    if (Platform.isIOS) {
      return await getApplicationDocumentsDirectory();
    } else if (Platform.isAndroid) {
      final downloadsDir = Directory('/storage/emulated/0/Download');

      if (await downloadsDir.exists()) {
        return downloadsDir;
      }

      final externalDir = await getExternalStorageDirectory();
      if (externalDir != null) {
        return externalDir;
      }

      return await getApplicationDocumentsDirectory();
    } else {
      return await getApplicationDocumentsDirectory();
    }
  }

  static String getCountryCode(String number) {
    if (number.startsWith('+') && number.contains(' ')) {
      return number.split(' ')[0];
    }
    return '+91'; // Default to India if no country code found
  }

  static String getCountryIsoCode(String dialCode) {
    // Comprehensive map of dial codes to ISO codes
    const dialCodeToIso = {
      '+1': 'US', // United States/Canada
      '+7': 'RU', // Russia
      '+20': 'EG', // Egypt
      '+27': 'ZA', // South Africa
      '+30': 'GR', // Greece
      '+31': 'NL', // Netherlands
      '+32': 'BE', // Belgium
      '+33': 'FR', // France
      '+34': 'ES', // Spain
      '+36': 'HU', // Hungary
      '+39': 'IT', // Italy
      '+40': 'RO', // Romania
      '+41': 'CH', // Switzerland
      '+43': 'AT', // Austria
      '+44': 'GB', // United Kingdom
      '+45': 'DK', // Denmark
      '+46': 'SE', // Sweden
      '+47': 'NO', // Norway
      '+48': 'PL', // Poland
      '+49': 'DE', // Germany
      '+51': 'PE', // Peru
      '+52': 'MX', // Mexico
      '+53': 'CU', // Cuba
      '+54': 'AR', // Argentina
      '+55': 'BR', // Brazil
      '+56': 'CL', // Chile
      '+57': 'CO', // Colombia
      '+58': 'VE', // Venezuela
      '+60': 'MY', // Malaysia
      '+61': 'AU', // Australia
      '+62': 'ID', // Indonesia
      '+63': 'PH', // Philippines
      '+64': 'NZ', // New Zealand
      '+65': 'SG', // Singapore
      '+66': 'TH', // Thailand
      '+81': 'JP', // Japan
      '+82': 'KR', // South Korea
      '+84': 'VN', // Vietnam
      '+86': 'CN', // China
      '+90': 'TR', // Turkey
      '+91': 'IN', // India
      '+92': 'PK', // Pakistan
      '+93': 'AF', // Afghanistan
      '+94': 'LK', // Sri Lanka
      '+95': 'MM', // Myanmar
      '+98': 'IR', // Iran
      '+212': 'MA', // Morocco
      '+213': 'DZ', // Algeria
      '+216': 'TN', // Tunisia
      '+218': 'LY', // Libya
      '+220': 'GM', // Gambia
      '+221': 'SN', // Senegal
      '+233': 'GH', // Ghana
      '+234': 'NG', // Nigeria
      '+237': 'CM', // Cameroon
      '+251': 'ET', // Ethiopia
      '+254': 'KE', // Kenya
      '+255': 'TZ', // Tanzania
      '+256': 'UG', // Uganda
      '+260': 'ZM', // Zambia
      '+263': 'ZW', // Zimbabwe
      '+351': 'PT', // Portugal
      '+352': 'LU', // Luxembourg
      '+353': 'IE', // Ireland
      '+354': 'IS', // Iceland
      '+355': 'AL', // Albania
      '+356': 'MT', // Malta
      '+357': 'CY', // Cyprus
      '+358': 'FI', // Finland
      '+359': 'BG', // Bulgaria
      '+370': 'LT', // Lithuania
      '+371': 'LV', // Latvia
      '+372': 'EE', // Estonia
      '+373': 'MD', // Moldova
      '+374': 'AM', // Armenia
      '+375': 'BY', // Belarus
      '+376': 'AD', // Andorra
      '+377': 'MC', // Monaco
      '+378': 'SM', // San Marino
      '+380': 'UA', // Ukraine
      '+381': 'RS', // Serbia
      '+382': 'ME', // Montenegro
      '+385': 'HR', // Croatia
      '+386': 'SI', // Slovenia
      '+387': 'BA', // Bosnia and Herzegovina
      '+420': 'CZ', // Czech Republic
      '+421': 'SK', // Slovakia
      '+423': 'LI', // Liechtenstein
      '+501': 'BZ', // Belize
      '+502': 'GT', // Guatemala
      '+503': 'SV', // El Salvador
      '+504': 'HN', // Honduras
      '+505': 'NI', // Nicaragua
      '+506': 'CR', // Costa Rica
      '+507': 'PA', // Panama
      '+591': 'BO', // Bolivia
      '+593': 'EC', // Ecuador
      '+595': 'PY', // Paraguay
      '+598': 'UY', // Uruguay
      '+673': 'BN', // Brunei
      '+852': 'HK', // Hong Kong
      '+853': 'MO', // Macau
      '+855': 'KH', // Cambodia
      '+856': 'LA', // Laos
      '+880': 'BD', // Bangladesh
      '+886': 'TW', // Taiwan
      '+960': 'MV', // Maldives
      '+961': 'LB', // Lebanon
      '+962': 'JO', // Jordan
      '+963': 'SY', // Syria
      '+964': 'IQ', // Iraq
      '+965': 'KW', // Kuwait
      '+966': 'SA', // Saudi Arabia
      '+967': 'YE', // Yemen
      '+968': 'OM', // Oman
      '+971': 'AE', // United Arab Emirates
      '+972': 'IL', // Israel
      '+973': 'BH', // Bahrain
      '+974': 'QA', // Qatar
      '+975': 'BT', // Bhutan
      '+976': 'MN', // Mongolia
      '+977': 'NP', // Nepal
      '+992': 'TJ', // Tajikistan
      '+993': 'TM', // Turkmenistan
      '+994': 'AZ', // Azerbaijan
      '+995': 'GE', // Georgia
      '+996': 'KG', // Kyrgyzstan
      '+998': 'UZ', // Uzbekistan
    };
    return dialCodeToIso[dialCode] ?? 'IN'; // Default to IN if not found
  }

  // Helper method to validate base64 string
  bool isValidBase64(String str) {
    print('base64 - $str');
    try {
      if (str.isEmpty) return false;
      if (str.length % 4 != 0) return false;

      final decoded = base64Decode(str);
      if (decoded.isEmpty) return false;

      // Check for PDF magic number (%PDF-)
      if (decoded.length < 5) return false;
      final header = String.fromCharCodes(decoded.take(5));
      if (!header.startsWith('%PDF-')) {
        debugPrint('❌ Invalid PDF header: $header');
        return false;
      }

      return true;
    } catch (e) {
      debugPrint('❌ Base64 validation error: $e');
      return false;
    }
  }

  static String cleanUrl(String url) {
    final regex = RegExp(r'^(https?:\/\/)([^\/]+)\/\/(.*)');
    return url.replaceAllMapped(regex, (match) {
      return '${match.group(1)}${match.group(2)}/${match.group(3)}';
    });
  }

  // Alternative implementation using memory compression if the file approach doesn't work
  static Future<Uint8List> compressImageDataInMemory(
      Uint8List imageData, double targetKB) async {
    try {
      // Start with 90% quality
      int quality = 90;
      Uint8List compressedData = imageData;

      // Compress in steps, reducing quality until we get under the target size
      while (compressedData.length / 1024 > targetKB && quality > 10) {
        try {
          final result = await FlutterImageCompress.compressWithList(
            imageData,
            quality: quality,
            format: CompressFormat.png,
          );

          compressedData = result;

          // Reduce quality for next iteration if still too large
          quality -= 10;
        } catch (e) {
          debugPrint('Error in memory compression loop: $e');
          break; // Exit if compression fails
        }
      }

      return compressedData;
    } catch (e) {
      debugPrint('Error compressing image in memory: $e');
      return imageData; // Return original if compression fails
    }
  }

  /// Converts minutes to a human-readable duration format
  /// Examples: 240 minutes -> "4 hours", 150 minutes -> "2 hours 30 min"
  static String formatDurationFromMinutes(int minutes) {
    if (minutes <= 0) return '0 min';
    
    final hours = minutes ~/ 60;
    final remainingMinutes = minutes % 60;
    
    if (hours == 0) {
      return '$minutes min';
    } else if (remainingMinutes == 0) {
      return hours == 1 ? '1 hour' : '$hours hours';
    } else {
      final hourText = hours == 1 ? '1 hour' : '$hours hours';
      final minuteText = remainingMinutes == 1 ? '1 min' : '$remainingMinutes min';
      return '$hourText $minuteText';
    }
  }
}
