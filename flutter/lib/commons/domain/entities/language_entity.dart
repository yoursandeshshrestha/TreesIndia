import 'dart:ui';

class LanguageEntity {
  final String name;
  final String languageCode;
  final String? countryCode;

  LanguageEntity({
    required this.name,
    required this.languageCode,
    this.countryCode,
  });

  Locale get locale => Locale(languageCode, countryCode);

  // Serialization method
  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'languageCode': languageCode,
      'countryCode': countryCode,
    };
  }

  // Deserialization method
  factory LanguageEntity.fromJson(Map<String, dynamic> json) {
    return LanguageEntity(
      name: json['name'],
      languageCode: json['languageCode'],
      countryCode: json['countryCode'],
    );
  }
}
