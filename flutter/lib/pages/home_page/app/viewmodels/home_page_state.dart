import 'package:equatable/equatable.dart';
import '../../domain/entities/category_entity.dart';
import '../../domain/entities/subcategory_entity.dart';
import '../../domain/entities/service_entity.dart';
import '../../../services_page/domain/entities/search_suggestion_entity.dart';
import '../../../services_page/domain/entities/service_detail_entity.dart';

enum HomePageStatus { initial, loading, success, failure }

class HomePageState extends Equatable {
  final HomePageStatus status;
  final List<CategoryEntity> categories;
  final List<SubcategoryEntity> subcategories;
  final List<ServiceEntity> services;
  final List<SearchSuggestionEntity> searchSuggestions;
  final List<ServiceDetailEntity> popularServices;
  final String errorMessage;
  final bool isLoadingCategories;
  final bool isLoadingSubcategories;
  final bool isLoadingServices;
  final bool isLoadingSearchSuggestions;
  final bool isLoadingPopularServices;

  const HomePageState({
    this.status = HomePageStatus.initial,
    this.categories = const [],
    this.subcategories = const [],
    this.services = const [],
    this.searchSuggestions = const [],
    this.popularServices = const [],
    this.errorMessage = '',
    this.isLoadingCategories = false,
    this.isLoadingSubcategories = false,
    this.isLoadingServices = false,
    this.isLoadingSearchSuggestions = false,
    this.isLoadingPopularServices = false,
  });

  HomePageState copyWith({
    HomePageStatus? status,
    List<CategoryEntity>? categories,
    List<SubcategoryEntity>? subcategories,
    List<ServiceEntity>? services,
    List<SearchSuggestionEntity>? searchSuggestions,
    List<ServiceDetailEntity>? popularServices,
    String? errorMessage,
    bool? isLoadingCategories,
    bool? isLoadingSubcategories,
    bool? isLoadingServices,
    bool? isLoadingSearchSuggestions,
    bool? isLoadingPopularServices,
  }) {
    return HomePageState(
      status: status ?? this.status,
      categories: categories ?? this.categories,
      subcategories: subcategories ?? this.subcategories,
      services: services ?? this.services,
      searchSuggestions: searchSuggestions ?? this.searchSuggestions,
      popularServices: popularServices ?? this.popularServices,
      errorMessage: errorMessage ?? this.errorMessage,
      isLoadingCategories: isLoadingCategories ?? this.isLoadingCategories,
      isLoadingSubcategories:
          isLoadingSubcategories ?? this.isLoadingSubcategories,
      isLoadingServices: isLoadingServices ?? this.isLoadingServices,
      isLoadingSearchSuggestions:
          isLoadingSearchSuggestions ?? this.isLoadingSearchSuggestions,
      isLoadingPopularServices:
          isLoadingPopularServices ?? this.isLoadingPopularServices,
    );
  }

  @override
  List<Object> get props => [
        status,
        categories,
        subcategories,
        services,
        searchSuggestions,
        popularServices,
        errorMessage,
        isLoadingCategories,
        isLoadingSubcategories,
        isLoadingServices,
        isLoadingSearchSuggestions,
        isLoadingPopularServices,
      ];
}
