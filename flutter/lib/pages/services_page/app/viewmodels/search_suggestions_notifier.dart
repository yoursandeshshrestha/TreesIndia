import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/get_search_suggestions_usecase.dart';
import 'search_suggestions_state.dart';

class SearchSuggestionsNotifier extends StateNotifier<SearchSuggestionsState> {
  final GetSearchSuggestionsUseCase getSearchSuggestionsUseCase;

  SearchSuggestionsNotifier({required this.getSearchSuggestionsUseCase})
      : super(const SearchSuggestionsState());

  Future<void> loadSearchSuggestions() async {
    state = state.copyWith(status: SearchSuggestionsStatus.loading);

    try {
      final response = await getSearchSuggestionsUseCase();
      state = state.copyWith(
        status: SearchSuggestionsStatus.success,
        keywords: response.keywords,
        services: response.services,
      );
    } catch (error) {
      state = state.copyWith(
        status: SearchSuggestionsStatus.failure,
        errorMessage: error.toString(),
      );
    }
  }

  void clearSearchSuggestions() {
    state = const SearchSuggestionsState();
  }
}
