import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
    // Don't load user location - we want to show all services without location restriction
    // await _loadUserLocation();

    // Fetch category details if both IDs are provided
    await _fetchCategoryDetails();

    // Load all services without location filter
    await _loadServices(refresh: true);
  }

  Future<void> _fetchCategoryDetails() async {
    // If we have both category ID (Level 1) and subcategory ID (Level 2)
    if (state.currentCategoryId != null &&
        state.currentCategoryId != 0 &&
        state.currentSubcategoryId != null &&
        state.currentSubcategoryId != 0) {
      try {
        // Fetch Level 1 category details to get Level 2 info
        final level1CategoryDetail =
            await getCategoryByIdUseCase.call(state.currentCategoryId!);

        // Find the matching Level 2 subcategory
        final matchingLevel2Subcategory = level1CategoryDetail.subcategories.firstWhere(
          (sub) => sub.id == state.currentSubcategoryId,
          orElse: () => level1CategoryDetail.subcategories.first,
        );

        // Fetch Level 2 category details to get its children (Level 3)
        final level2CategoryDetail =
            await getCategoryByIdUseCase.call(state.currentSubcategoryId!);

        // Level 3 categories are the children of the Level 2 category
        final level3Categories = level2CategoryDetail.subcategories;

        // Store the original Level 2 category ID for filtering
        // This is the Level 2 category that was clicked
        _originalLevel2CategoryId = state.currentSubcategoryId;
        
        if (kDebugMode) {
          print('ServiceNotifier: Level 2 category ID: ${_originalLevel2CategoryId}');
          print('ServiceNotifier: Found ${level3Categories.length} Level 3 categories');
        }
        
        state = state.copyWith(
          currentCategory: level1CategoryDetail.category,
          currentSubcategory: matchingLevel2Subcategory,
          level3Categories: level3Categories,
          // Keep currentSubcategoryId as Level 2 to show all services initially
          currentSubcategoryId: state.currentSubcategoryId,
        );
      } catch (e) {
        // Log error but don't fail the entire flow
        if (kDebugMode) print('Error fetching category details: $e');
      }
    } else if (state.currentCategoryId != null && state.currentCategoryId != 0) {
      // If we only have a category ID (Level 1), fetch its children (Level 2)
      try {
        final categoryDetail =
            await getCategoryByIdUseCase.call(state.currentCategoryId!);

        state = state.copyWith(
          currentCategory: categoryDetail.category,
        );
      } catch (e) {
        // Log error but don't fail the entire flow
        if (kDebugMode) print('Error fetching category details: $e');
      }
    }
  }

  Future<void> _loadServices({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(status: ServiceStatus.loading);
    }

    try {
      final currentPage = refresh ? 1 : (state.pagination?.page ?? 0) + 1;

      // If we have Level 3 categories and a Level 2 category, 
      // filter by Level 2 to get all services, then group by Level 3
      // Otherwise, use the current subcategory filter
      int? filterSubcategoryId;
      if (state.level3Categories.isNotEmpty && _originalLevel2CategoryId != null) {
        // When showing Level 3 categories, filter by Level 2 to get all services
        // We'll group them by Level 3 on the UI side
        filterSubcategoryId = _originalLevel2CategoryId;
        if (kDebugMode) {
          print('ServiceNotifier: Filtering by Level 2 category ID: $filterSubcategoryId');
          print('ServiceNotifier: Level 3 categories count: ${state.level3Categories.length}');
        }
      } else {
        filterSubcategoryId = state.currentSubcategoryId != 0 ? state.currentSubcategoryId : null;
        if (kDebugMode) {
          print('ServiceNotifier: Filtering by subcategory ID: $filterSubcategoryId');
        }
      }

      if (kDebugMode) {
        print('ServiceNotifier: Loading services - categoryId: ${state.currentCategoryId}, subcategoryId: $filterSubcategoryId, page: $currentPage');
      }

      // Don't filter by location - show all services for the category
      // Only pass city/state if they have actual values
      final response = await getServicesUseCase.call(
        city: '', // Empty string to not filter by city
        state: '', // Empty string to not filter by state
        categoryId:
            state.currentCategoryId != 0 ? state.currentCategoryId : null,
        subcategoryId: filterSubcategoryId,
        page: currentPage,
        limit: 10,
      );

      if (kDebugMode) {
        print('ServiceNotifier: Received ${response.services.length} services, total: ${response.pagination.total}');
      }

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

  // Track the original Level 2 category ID
  int? _originalLevel2CategoryId;
  
  void selectLevel3Category(int? level3CategoryId) {
    // If level3CategoryId is null, reset to original Level 2 category to show all services
    // Otherwise, filter by Level 3 category
    final newSubcategoryId = level3CategoryId ?? _originalLevel2CategoryId;
    state = state.copyWith(
      currentSubcategoryId: newSubcategoryId,
    );
    // Reload services with the new filter
    _loadServices(refresh: true);
  }

  void clearState() {
    state = const ServiceState();
  }
}
