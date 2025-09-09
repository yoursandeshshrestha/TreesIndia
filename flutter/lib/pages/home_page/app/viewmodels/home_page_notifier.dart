import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/get_categories_usecase.dart';
import '../../domain/usecases/get_subcategories_usecase.dart';
import '../../../services_page/domain/usecases/get_search_suggestions_usecase.dart';
import '../../../services_page/domain/usecases/get_popular_services_usecase.dart';
import 'home_page_state.dart';

class HomePageNotifier extends StateNotifier<HomePageState> {
  final GetCategoriesUseCase getCategoriesUseCase;
  final GetSubcategoriesUseCase getSubcategoriesUseCase;
  final GetSearchSuggestionsUseCase getSearchSuggestionsUseCase;
  final GetPopularServicesUseCase getPopularServicesUseCase;

  HomePageNotifier({
    required this.getCategoriesUseCase,
    required this.getSubcategoriesUseCase,
    required this.getSearchSuggestionsUseCase,
    required this.getPopularServicesUseCase,
  }) : super(const HomePageState());

  Future<void> loadCategories() async {
    state = state.copyWith(isLoadingCategories: true);

    try {
      final categories = await getCategoriesUseCase();
      state = state.copyWith(
        isLoadingCategories: false,
        categories: categories,
      );
    } catch (error) {
      state = state.copyWith(
        isLoadingCategories: false,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> loadSubcategoriesByCategory(int categoryId) async {
    state = state.copyWith(isLoadingSubcategories: true);

    try {
      final subcategories = await getSubcategoriesUseCase(categoryId);
      state = state.copyWith(
        isLoadingSubcategories: false,
        subcategories: subcategories,
      );
    } catch (error) {
      state = state.copyWith(
        isLoadingSubcategories: false,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> loadSearchSuggestions() async {
    state = state.copyWith(isLoadingSearchSuggestions: true);

    try {
      final response = await getSearchSuggestionsUseCase();
      state = state.copyWith(
        isLoadingSearchSuggestions: false,
        searchSuggestions: response.keywords,
      );
    } catch (error) {
      state = state.copyWith(
        isLoadingSearchSuggestions: false,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> loadPopularServices() async {
    state = state.copyWith(isLoadingPopularServices: true);

    try {
      final response = await getPopularServicesUseCase();
      state = state.copyWith(
        isLoadingPopularServices: false,
        popularServices: response.data,
      );
    } catch (error) {
      state = state.copyWith(
        isLoadingPopularServices: false,
        errorMessage: error.toString(),
      );
    }
  }

  void clearSubcategories() {
    state = state.copyWith(subcategories: []);
  }

  void clearSearchSuggestions() {
    state = state.copyWith(searchSuggestions: []);
  }

  void clearError() {
    state = state.copyWith(errorMessage: '');
  }
}
