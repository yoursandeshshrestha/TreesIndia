import 'package:equatable/equatable.dart';
import '../../domain/entities/category_entity.dart';
import '../../domain/entities/subcategory_entity.dart';
import '../../domain/entities/service_entity.dart';
import '../../domain/entities/promotion_banner_entity.dart';
import '../../../services_page/domain/entities/search_suggestion_entity.dart';
import '../../../services_page/domain/entities/service_detail_entity.dart';
import '../../../profile_page/app/views/menu_pages/my_properties/domain/entities/property_entity.dart';

enum HomePageStatus { initial, loading, success, failure }

class HomePageState extends Equatable {
  final HomePageStatus status;
  final List<CategoryEntity> categories;
  final List<SubcategoryEntity> subcategories;
  final List<ServiceEntity> services;
  final List<SearchSuggestionEntity> searchSuggestions;
  final List<ServiceDetailEntity> popularServices;
  final List<ServiceDetailEntity> allServices;
  final List<PropertyEntity> saleProperties;
  final List<PropertyEntity> rentProperties;
  final List<PromotionBannerEntity> promotionBanners;
  final String errorMessage;
  final bool isLoadingCategories;
  final bool isLoadingSubcategories;
  final bool isLoadingServices;
  final bool isLoadingSearchSuggestions;
  final bool isLoadingPopularServices;
  final bool isLoadingAllServices;
  final bool isLoadingSaleProperties;
  final bool isLoadingRentProperties;
  final bool isLoadingPromotionBanners;

  const HomePageState({
    this.status = HomePageStatus.initial,
    this.categories = const [],
    this.subcategories = const [],
    this.services = const [],
    this.searchSuggestions = const [],
    this.popularServices = const [],
    this.allServices = const [],
    this.saleProperties = const [],
    this.rentProperties = const [],
    this.promotionBanners = const [],
    this.errorMessage = '',
    this.isLoadingCategories = false,
    this.isLoadingSubcategories = false,
    this.isLoadingServices = false,
    this.isLoadingSearchSuggestions = false,
    this.isLoadingPopularServices = false,
    this.isLoadingAllServices = false,
    this.isLoadingSaleProperties = false,
    this.isLoadingRentProperties = false,
    this.isLoadingPromotionBanners = false,
  });

  HomePageState copyWith({
    HomePageStatus? status,
    List<CategoryEntity>? categories,
    List<SubcategoryEntity>? subcategories,
    List<ServiceEntity>? services,
    List<SearchSuggestionEntity>? searchSuggestions,
    List<ServiceDetailEntity>? popularServices,
    List<ServiceDetailEntity>? allServices,
    List<PropertyEntity>? saleProperties,
    List<PropertyEntity>? rentProperties,
    List<PromotionBannerEntity>? promotionBanners,
    String? errorMessage,
    bool? isLoadingCategories,
    bool? isLoadingSubcategories,
    bool? isLoadingServices,
    bool? isLoadingSearchSuggestions,
    bool? isLoadingPopularServices,
    bool? isLoadingAllServices,
    bool? isLoadingSaleProperties,
    bool? isLoadingRentProperties,
    bool? isLoadingPromotionBanners,
  }) {
    return HomePageState(
      status: status ?? this.status,
      categories: categories ?? this.categories,
      subcategories: subcategories ?? this.subcategories,
      services: services ?? this.services,
      searchSuggestions: searchSuggestions ?? this.searchSuggestions,
      popularServices: popularServices ?? this.popularServices,
      allServices: allServices ?? this.allServices,
      saleProperties: saleProperties ?? this.saleProperties,
      rentProperties: rentProperties ?? this.rentProperties,
      promotionBanners: promotionBanners ?? this.promotionBanners,
      errorMessage: errorMessage ?? this.errorMessage,
      isLoadingCategories: isLoadingCategories ?? this.isLoadingCategories,
      isLoadingSubcategories:
          isLoadingSubcategories ?? this.isLoadingSubcategories,
      isLoadingServices: isLoadingServices ?? this.isLoadingServices,
      isLoadingSearchSuggestions:
          isLoadingSearchSuggestions ?? this.isLoadingSearchSuggestions,
      isLoadingPopularServices:
          isLoadingPopularServices ?? this.isLoadingPopularServices,
      isLoadingAllServices:
          isLoadingAllServices ?? this.isLoadingAllServices,
      isLoadingSaleProperties:
          isLoadingSaleProperties ?? this.isLoadingSaleProperties,
      isLoadingRentProperties:
          isLoadingRentProperties ?? this.isLoadingRentProperties,
      isLoadingPromotionBanners:
          isLoadingPromotionBanners ?? this.isLoadingPromotionBanners,
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
        allServices,
        saleProperties,
        rentProperties,
        promotionBanners,
        errorMessage,
        isLoadingCategories,
        isLoadingSubcategories,
        isLoadingServices,
        isLoadingSearchSuggestions,
        isLoadingPopularServices,
        isLoadingAllServices,
        isLoadingSaleProperties,
        isLoadingRentProperties,
        isLoadingPromotionBanners,
      ];
}
