import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../commons/presenters/providers/location_onboarding_provider.dart';
import '../../../home_page/domain/usecases/get_category_by_id_usecase.dart';
import '../../domain/usecases/get_services_usecase.dart';
import 'service_state.dart';

class ServiceNotifier extends StateNotifier<ServiceState> {
  final GetServicesUseCase getServicesUseCase;
  final GetCategoryByIdUseCase getCategoryByIdUseCase;
  final Ref ref;

  ServiceNotifier({
    required this.getServicesUseCase,
    required this.getCategoryByIdUseCase,
    required this.ref,
  }) : super(const ServiceState());

  void setCategoryAndSubcategoryIds(
    int? categoryId,
    int? subcategoryId,
  ) {
    state = state.copyWith(
      currentCategoryId: categoryId,
      currentSubcategoryId: subcategoryId,
    );
  }

  Future<void> initializeAndLoadServices() async {
    // Get user location
    await _loadUserLocation();

    if (state.userCity == null && state.userState == null) {
      state = state.copyWith(
        status: ServiceStatus.failure,
        errorMessage: 'User location not available',
      );
      return;
    }

    // Fetch category details if both IDs are provided
    await _fetchCategoryDetails();

    // Load services
    await _loadServices(refresh: true);
  }

  Future<void> _fetchCategoryDetails() async {
    if (state.currentCategoryId != null &&
        state.currentCategoryId != 0 &&
        state.currentSubcategoryId != null &&
        state.currentSubcategoryId != 0) {
      try {
        final categoryDetail =
            await getCategoryByIdUseCase.call(state.currentCategoryId!);

        if (categoryDetail.subcategories.isEmpty) {
          return;
        }

        // Find matching subcategory
        final matchingSubcategory = categoryDetail.subcategories.firstWhere(
          (sub) => sub.id == state.currentSubcategoryId,
          orElse: () => categoryDetail.subcategories.first,
        );

        state = state.copyWith(
          currentCategory: categoryDetail.category,
          currentSubcategory: matchingSubcategory,
        );
      } catch (e) {
        // Log error but don't fail the entire flow
        print('Error fetching category details: $e');
      }
    }
  }

  Future<void> _loadUserLocation() async {
    try {
      final locationService = ref.read(locationOnboardingServiceProvider);
      final location = await locationService.getSavedLocation();

      if (location != null) {
        state = state.copyWith(
          userCity: location.city,
          userState: location.state,
        );
      }
    } catch (e) {
      // Keep existing state if location fetch fails
    }
  }

  Future<void> _loadServices({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(status: ServiceStatus.loading);
    }

    try {
      final currentPage = refresh ? 1 : (state.pagination?.page ?? 0) + 1;

      final response = await getServicesUseCase.call(
        city: state.userCity ?? '',
        state: state.userState ?? '',
        categoryId:
            state.currentCategoryId != 0 ? state.currentCategoryId : null,
        subcategoryId:
            state.currentSubcategoryId != 0 ? state.currentSubcategoryId : null,
        page: currentPage,
        limit: 10,
      );

      if (refresh) {
        state = state.copyWith(
          status: ServiceStatus.success,
          services: response.services,
          pagination: response.pagination,
          hasMoreServices: response.pagination.hasNext,
        );
      } else {
        final allServices = [...state.services, ...response.services];
        state = state.copyWith(
          status: ServiceStatus.success,
          services: allServices,
          pagination: response.pagination,
          hasMoreServices: response.pagination.hasNext,
          isLoadingMore: false,
        );
      }
    } catch (error) {
      state = state.copyWith(
        status: refresh ? ServiceStatus.failure : ServiceStatus.success,
        errorMessage: error.toString(),
        isLoadingMore: false,
      );
    }
  }

  Future<void> loadMoreServices() async {
    if (state.isLoadingMore || !state.hasMoreServices) {
      return;
    }

    state = state.copyWith(isLoadingMore: true);
    await _loadServices();
  }

  void clearState() {
    state = const ServiceState();
  }
}
