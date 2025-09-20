import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/vendor_filters_entity.dart';
import '../../domain/usecases/get_vendors_usecase.dart';
import 'vendor_state.dart';

class VendorNotifier extends StateNotifier<VendorState> {
  final GetVendorsUsecase getVendorsUsecase;

  VendorNotifier(this.getVendorsUsecase) : super(const VendorState());

  Future<void> loadVendors({bool isRefresh = false}) async {
    final isInitialLoad = state.status == VendorStatus.initial;

    if (isRefresh || isInitialLoad) {
      state = state.copyWith(
        status: VendorStatus.loading,
        vendors: isRefresh ? [] : state.vendors,
        hasReachedMax: false,
        clearError: true,
      );
    } else if (state.hasReachedMax || state.status == VendorStatus.loadingMore) {
      return;
    } else {
      state = state.copyWith(status: VendorStatus.loadingMore);
    }

    try {
      final filters = (isRefresh || isInitialLoad)
          ? state.filters.copyWith(page: 1)
          : state.filters.copyWith(page: state.filters.page + 1);

      final newVendors = await getVendorsUsecase.call(filters);

      final allVendors = isRefresh || state.filters.page == 1
          ? newVendors
          : [...state.vendors, ...newVendors];

      state = state.copyWith(
        status: VendorStatus.success,
        vendors: allVendors,
        filters: filters,
        hasReachedMax: newVendors.length < 12, // Assume page size of 12
        clearError: true,
      );
    } catch (e) {
      state = state.copyWith(
        status: VendorStatus.failure,
        errorMessage: 'Failed to load vendors: $e',
      );
    }
  }

  void setBusinessType(String? businessType) {
    final newFilters = state.filters.copyWith(
      businessType: businessType,
      page: 1,
      clearBusinessType: businessType == null,
    );
    state = state.copyWith(filters: newFilters);
    loadVendors(isRefresh: true);
  }

  void setServices(List<String>? services) {
    final newFilters = state.filters.copyWith(
      services: services,
      page: 1,
      clearServices: services == null || services.isEmpty,
    );
    state = state.copyWith(filters: newFilters);
    loadVendors(isRefresh: true);
  }

  void setLocation(String? location) {
    final newFilters = state.filters.copyWith(
      location: location,
      page: 1,
      clearLocation: location == null || location.isEmpty,
    );
    state = state.copyWith(filters: newFilters);
    loadVendors(isRefresh: true);
  }

  void setCity(String? city) {
    final newFilters = state.filters.copyWith(
      city: city,
      page: 1,
      clearCity: city == null || city.isEmpty,
    );
    state = state.copyWith(filters: newFilters);
    loadVendors(isRefresh: true);
  }

  void setState(String? state) {
    final newFilters = this.state.filters.copyWith(
      state: state,
      page: 1,
      clearState: state == null || state.isEmpty,
    );
    this.state = this.state.copyWith(filters: newFilters);
    loadVendors(isRefresh: true);
  }

  void setSortBy(VendorSortType sortBy) {
    final newFilters = state.filters.copyWith(
      sortBy: sortBy,
      page: 1,
    );
    state = state.copyWith(filters: newFilters);
    loadVendors(isRefresh: true);
  }

  void removeFilter(String filterType, dynamic value) {
    VendorFiltersEntity newFilters = state.filters;

    switch (filterType) {
      case 'businessType':
        newFilters = newFilters.copyWith(clearBusinessType: true, page: 1);
        break;
      case 'services':
        if (value is String) {
          final currentServices = List<String>.from(newFilters.services ?? []);
          currentServices.remove(value);
          newFilters = newFilters.copyWith(
            services: currentServices.isEmpty ? null : currentServices,
            clearServices: currentServices.isEmpty,
            page: 1,
          );
        }
        break;
      case 'location':
        newFilters = newFilters.copyWith(clearLocation: true, page: 1);
        break;
      case 'city':
        newFilters = newFilters.copyWith(clearCity: true, page: 1);
        break;
      case 'state':
        newFilters = newFilters.copyWith(clearState: true, page: 1);
        break;
    }

    state = state.copyWith(filters: newFilters);
    loadVendors(isRefresh: true);
  }

  void clearAllFilters() {
    const newFilters = VendorFiltersEntity(page: 1);
    state = state.copyWith(filters: newFilters);
    loadVendors(isRefresh: true);
  }
}