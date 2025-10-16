import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/get_categories_usecase.dart';
import '../../domain/usecases/get_subcategories_usecase.dart';
import '../../domain/usecases/get_promotion_banners_usecase.dart';
import '../../../services_page/domain/usecases/get_search_suggestions_usecase.dart';
import '../../../services_page/domain/usecases/get_popular_services_usecase.dart';
import '../../../rental_and_properties/domain/usecases/get_properties_usecase.dart';
import '../../../rental_and_properties/domain/entities/property_filters_entity.dart';
import 'home_page_state.dart';

class HomePageNotifier extends StateNotifier<HomePageState> {
  final GetCategoriesUseCase getCategoriesUseCase;
  final GetSubcategoriesUseCase getSubcategoriesUseCase;
  final GetSearchSuggestionsUseCase getSearchSuggestionsUseCase;
  final GetPopularServicesUseCase getPopularServicesUseCase;
  final GetPropertiesUsecase getPropertiesUsecase;
  final GetPromotionBannersUseCase getPromotionBannersUseCase;

  HomePageNotifier({
    required this.getCategoriesUseCase,
    required this.getSubcategoriesUseCase,
    required this.getSearchSuggestionsUseCase,
    required this.getPopularServicesUseCase,
    required this.getPropertiesUsecase,
    required this.getPromotionBannersUseCase,
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

  Future<void> loadSaleProperties({String? city, String? state}) async {
    this.state = this.state.copyWith(isLoadingSaleProperties: true);

    try {
      final filters = PropertyFiltersEntity(
        page: 1,
        limit: 8,
        listingType: 'sale',
        isApproved: true,
        status: 'available',
        city: city,
        state: state,
      );

      final response = await getPropertiesUsecase(filters);
      this.state = this.state.copyWith(
        isLoadingSaleProperties: false,
        saleProperties: response.properties,
      );
    } catch (error) {
      this.state = this.state.copyWith(
        isLoadingSaleProperties: false,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> loadRentProperties({String? city, String? state}) async {
    this.state = this.state.copyWith(isLoadingRentProperties: true);

    try {
      final filters = PropertyFiltersEntity(
        page: 1,
        limit: 8,
        listingType: 'rent',
        isApproved: true,
        status: 'available',
        city: city,
        state: state,
      );

      final response = await getPropertiesUsecase(filters);
      this.state = this.state.copyWith(
        isLoadingRentProperties: false,
        rentProperties: response.properties,
      );
    } catch (error) {
      this.state = this.state.copyWith(
        isLoadingRentProperties: false,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> loadPromotionBanners() async {
    state = state.copyWith(isLoadingPromotionBanners: true);

    try {
      final banners = await getPromotionBannersUseCase();
      state = state.copyWith(
        isLoadingPromotionBanners: false,
        promotionBanners: banners,
      );
    } catch (error) {
      state = state.copyWith(
        isLoadingPromotionBanners: false,
        errorMessage: error.toString(),
      );
    }
  }
}
