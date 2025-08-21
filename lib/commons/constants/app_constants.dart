import 'package:trees_india/commons/domain/entities/language_entity.dart';

class AppConstants {
  // App Details
  static const String appName = 'Trees India';
  static const String appVersion = '1.0.0';
  static const String supportEmail = 'support@treesindia.com';

  static const String accept = 'application/json';
  static const String contentType = 'application/json';

  // Timeouts
  static const int networkTimeout = 600; // in seconds

  // Other App-Wide Constants
  static const String defaultLocale = 'en_US';

  static const int maxCacheItems = 100;

  static LanguageEntity defaultLanguage =
      LanguageEntity(languageCode: 'en', countryCode: 'US', name: 'English');

  static List<LanguageEntity> supportedLanguages = [
    LanguageEntity(languageCode: 'en', countryCode: 'US', name: 'English'),
    LanguageEntity(languageCode: 'hi', countryCode: 'IN', name: 'हिंदी'),
    // LanguageEntity(languageCode: 'ta', countryCode: 'IN', name: 'தமிழ்'),
    // LanguageEntity(languageCode: 'te', countryCode: 'IN', name: 'తెలుగు'),
    // LanguageEntity(languageCode: 'bn', countryCode: 'IN', name: 'বাংলা'),
    // LanguageEntity(languageCode: 'gu', countryCode: 'IN', name: 'ગુજરાતી'),
    // LanguageEntity(languageCode: 'ml', countryCode: 'IN', name: 'മലയാളം'),
    // LanguageEntity(languageCode: 'mr', countryCode: 'IN', name: 'मराठी'),
    // LanguageEntity(languageCode: 'pa', countryCode: 'IN', name: 'ਪੰਜਾਬੀ'),
    // LanguageEntity(languageCode: 'ps', countryCode: 'AF', name: 'پښتو'),
  ];
}
