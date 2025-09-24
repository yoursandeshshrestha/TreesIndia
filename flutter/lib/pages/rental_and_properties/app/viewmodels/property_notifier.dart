import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/property_filters_entity.dart';
import '../../domain/usecases/get_properties_usecase.dart';
import 'property_state.dart';

class PropertyNotifier extends StateNotifier<PropertyState> {
  final GetPropertiesUsecase getPropertiesUsecase;

  PropertyNotifier(this.getPropertiesUsecase) : super(const PropertyState());

  Future<void> loadProperties({PropertyFiltersEntity? newFilters}) async {
    final filters = newFilters ?? state.filters;

    state = state.copyWith(
      status: PropertyStatus.loading,
      filters: filters,
    );

    try {
      final response = await getPropertiesUsecase(filters);

      state = state.copyWith(
        status: PropertyStatus.success,
        properties: response.properties,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrev: response.hasPrev,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(
        status: PropertyStatus.failure,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> loadMoreProperties() async {
    if (!state.hasNext || state.isLoading) return;

    final nextPageFilters = state.filters.copyWith(page: state.page + 1);

    try {
      final response = await getPropertiesUsecase(nextPageFilters);

      state = state.copyWith(
        status: PropertyStatus.success,
        properties: [...state.properties, ...response.properties],
        filters: nextPageFilters,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrev: response.hasPrev,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(
        status: PropertyStatus.failure,
        errorMessage: e.toString(),
      );
    }
  }

  void updateFilters(PropertyFiltersEntity newFilters) {
    // Reset to page 1 when filters change
    final resetFilters = newFilters.copyWith(page: 1);
    loadProperties(newFilters: resetFilters);
  }

  void setListingType(String? listingType) {
    final newFilters = state.filters.copyWith(
      listingType: listingType,
      clearListingType: listingType == null,
    );
    updateFilters(newFilters);
  }

  void setTreesIndiaAssured(bool? assured) {
    final newFilters = state.filters.copyWith(
      uploadedByAdmin: assured,
      clearUploadedByAdmin: assured == null,
    );
    updateFilters(newFilters);
  }

  void setPropertyType(String? propertyType) {
    final newFilters = state.filters.copyWith(
      propertyType: propertyType,
      clearPropertyType: propertyType == null,
    );
    updateFilters(newFilters);
  }

  void setBedrooms(List<int>? bedrooms) {
    final newFilters = state.filters.copyWith(
      bedrooms: bedrooms,
      clearBedrooms: bedrooms == null || bedrooms.isEmpty,
    );
    updateFilters(newFilters);
  }

  void setPriceRange(double? minPrice, double? maxPrice) {
    final newFilters = state.filters.copyWith(
      minPrice: minPrice,
      maxPrice: maxPrice,
      clearPriceRange: minPrice == null && maxPrice == null,
    );
    updateFilters(newFilters);
  }

  void setAreaRange(double? minArea, double? maxArea) {
    final newFilters = state.filters.copyWith(
      minArea: minArea,
      maxArea: maxArea,
      clearAreaRange: minArea == null && maxArea == null,
    );
    updateFilters(newFilters);
  }

  void setFurnishingStatus(String? furnishingStatus) {
    final newFilters = state.filters.copyWith(
      furnishingStatus: furnishingStatus,
      clearFurnishingStatus: furnishingStatus == null,
    );
    updateFilters(newFilters);
  }

  void setSortBy(PropertySortType sortBy) {
    final newFilters = state.filters.copyWith(sortBy: sortBy);
    updateFilters(newFilters);
  }

  void clearAllFilters() {
    const defaultFilters = PropertyFiltersEntity();
    updateFilters(defaultFilters);
  }

  void removeFilter(String filterType, [dynamic value]) {
    var newFilters = state.filters;

    switch (filterType) {
      case 'listingType':
        newFilters = newFilters.copyWith(clearListingType: true);
        break;
      case 'uploadedByAdmin':
        newFilters = newFilters.copyWith(clearUploadedByAdmin: true);
        break;
      case 'propertyType':
        newFilters = newFilters.copyWith(clearPropertyType: true);
        break;
      case 'bedrooms':
        if (value != null && newFilters.bedrooms != null) {
          final updatedBedrooms = List<int>.from(newFilters.bedrooms!)
            ..remove(value as int);
          newFilters = newFilters.copyWith(
            bedrooms: updatedBedrooms.isEmpty ? null : updatedBedrooms,
            clearBedrooms: updatedBedrooms.isEmpty,
          );
        } else {
          newFilters = newFilters.copyWith(clearBedrooms: true);
        }
        break;
      case 'priceRange':
        newFilters = newFilters.copyWith(clearPriceRange: true);
        break;
      case 'areaRange':
        newFilters = newFilters.copyWith(clearAreaRange: true);
        break;
      case 'furnishingStatus':
        newFilters = newFilters.copyWith(clearFurnishingStatus: true);
        break;
    }

    updateFilters(newFilters);
  }
}