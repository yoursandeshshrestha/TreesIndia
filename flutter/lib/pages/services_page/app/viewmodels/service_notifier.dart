import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/presenters/providers/location_onboarding_provider.dart';
import '../../../home_page/domain/entities/category_entity.dart';
import '../../../home_page/domain/entities/subcategory_entity.dart';
import '../../domain/usecases/get_services_usecase.dart';
import 'service_state.dart';

class ServiceNotifier extends StateNotifier<ServiceState> {
  final GetServicesUseCase getServicesUseCase;
  final Ref ref;

  ServiceNotifier({
    required this.getServicesUseCase,
    required this.ref,
  }) : super(const ServiceState());

  void setCategoryAndSubcategory(
    CategoryEntity category,
    SubcategoryEntity subcategory,
  ) {
    state = state.copyWith(
      currentCategory: category,
      currentSubcategory: subcategory,
    );
  }

  Future<void> initializeAndLoadServices() async {
    if (state.currentCategory == null || state.currentSubcategory == null) {
      state = state.copyWith(
        status: ServiceStatus.failure,
        errorMessage: 'Category or subcategory not set',
      );
      return;
    }

    // Get user location
    await _loadUserLocation();


    if (state.userCity == null && state.userState == null) {
      state = state.copyWith(
        status: ServiceStatus.failure,
        errorMessage: 'User location not available',
      );
      return;
    }

    // Load services
    await _loadServices(refresh: true);
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

      final response = await getServicesUseCase(
        city: state.userCity ?? '',
        state: state.userState ?? '',
        categoryId: state.currentCategory!.id,
        subcategoryId: state.currentSubcategory!.id,
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
