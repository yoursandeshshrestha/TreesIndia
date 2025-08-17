import 'dart:convert';

import 'package:trees_india/commons/domain/entities/language_entity.dart';
import 'package:trees_india/commons/utils/services/centralized_local_storage_service.dart';
import 'package:logger/logger.dart';

class LanguageService {
  static const String languageKey = 'selected_language';
  final CentralizedLocalStorageService _localStorageService;

  final Logger _logger = Logger(); // Initialize logger

  // Constructor accepting a CentralizedLocalStorageService instance
  LanguageService(this._localStorageService);

  /// Loads the saved language from CentralizedLocalStorageService (Hive).
  Future<LanguageEntity?> loadLanguage() async {
    try {
      final jsonString = await _localStorageService.getData(languageKey) ?? "";
      if (jsonString.isEmpty) {
        return null; // No data saved, return null
      }
      return LanguageEntity.fromJson(jsonDecode(jsonString));
    } catch (e) {
      _logger.e(e);
    }
    return null; // Return null if no language is saved or an error occurs
  }

  /// Saves the new language using CentralizedLocalStorageService (Hive).
  Future<void> saveLanguage(LanguageEntity language) async {
    await _localStorageService.saveData(
        languageKey, jsonEncode(language.toJson()));
  }
}
