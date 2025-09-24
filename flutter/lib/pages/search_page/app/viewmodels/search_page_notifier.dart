import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../services_page/domain/usecases/get_search_suggestions_usecase.dart';
import '../../../services_page/domain/usecases/get_popular_services_usecase.dart';
import '../../../services_page/domain/usecases/search_services_usecase.dart';
import 'search_page_state.dart';

class SearchPageNotifier extends StateNotifier<SearchPageState> {
  final GetSearchSuggestionsUseCase getSearchSuggestionsUseCase;
  final GetPopularServicesUseCase getPopularServicesUseCase;
  final SearchServicesUseCase searchServicesUseCase;

  Timer? _debounceTimer;
  static const int _debounceDelayMs = 300;

  SearchPageNotifier({
    required this.getSearchSuggestionsUseCase,
    required this.getPopularServicesUseCase,
    required this.searchServicesUseCase,
  }) : super(const SearchPageState());

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }

  Future<void> loadSearchSuggestions() async {
    state = state.copyWith(isLoadingSearchSuggestions: true, errorMessage: '');

    try {
      final response = await getSearchSuggestionsUseCase();
      state = state.copyWith(
        isLoadingSearchSuggestions: false,
        searchSuggestions: response.keywords,
        popularServices: response.services,
      );
    } catch (error) {
      state = state.copyWith(
        isLoadingSearchSuggestions: false,
        errorMessage: error.toString(),
      );
    }
  }

  

  void searchServices(String query) {
    _debounceTimer?.cancel();

    if (query.trim().isEmpty) {
      state = state.copyWith(
        currentQuery: '',
        searchResults: [],
        pagination: null,
        searchMetadata: null,
      );
      return;
    }

    _debounceTimer = Timer(
      const Duration(milliseconds: _debounceDelayMs),
      () => _performSearch(query.trim()),
    );
  }

  Future<void> _performSearch(String query) async {
    state = state.copyWith(
      isSearching: true,
      currentQuery: query,
      errorMessage: '',
    );

    try {
      final response = await searchServicesUseCase(query: query);
      state = state.copyWith(
        isSearching: false,
        searchResults: response.results,
        pagination: response.pagination,
        searchMetadata: response.searchMetadata,
      );
    } catch (error) {
      state = state.copyWith(
        isSearching: false,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> searchWithKeyword(String keyword) async {
    state = state.copyWith(
      isSearching: true,
      currentQuery: keyword,
      errorMessage: '',
    );

    try {
      final response = await searchServicesUseCase(query: keyword);
      state = state.copyWith(
        isSearching: false,
        searchResults: response.results,
        pagination: response.pagination,
        searchMetadata: response.searchMetadata,
      );
    } catch (error) {
      state = state.copyWith(
        isSearching: false,
        errorMessage: error.toString(),
      );
    }
  }

  void clearSearch() {
    state = state.copyWith(
      currentQuery: '',
      searchResults: [],
      pagination: null,
      searchMetadata: null,
    );
  }

  void clearError() {
    state = state.copyWith(errorMessage: '');
  }
}
