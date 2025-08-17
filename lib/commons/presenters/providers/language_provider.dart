import 'package:trees_india/commons/domain/entities/language_entity.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import 'package:trees_india/commons/utils/services/centralized_local_storage_service.dart';
import 'package:trees_india/commons/utils/services/language_service.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// global language viewmodel
class LanguageViewModel extends StateNotifier<LanguageEntity?> {
  final LanguageService _languageService;

  LanguageViewModel(this._languageService) : super(null) {
    loadSavedLanguage();
  }

  loadSavedLanguage() async {
    try {
      state = await _languageService
          .loadLanguage()
          .timeout(const Duration(seconds: 2), onTimeout: () => null);
    } catch (_) {
      state = null;
    }
  }

  selectLanguage({
    required LanguageEntity language,
  }) {
    state = language;
  }
}

/// Riverpod provider for LocaleNotifier.
final languageProvider =
    StateNotifierProvider<LanguageViewModel, LanguageEntity?>((ref) {
  return LanguageViewModel(LanguageService(CentralizedLocalStorageService()));
})
      ..registerProvider();
