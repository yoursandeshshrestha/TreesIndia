import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/property_entity.dart';
import '../../domain/usecases/get_user_properties_usecase.dart';
import '../../domain/usecases/delete_property_usecase.dart';
import '../states/my_properties_state.dart';

class MyPropertiesNotifier extends StateNotifier<MyPropertiesState> {
  final GetUserPropertiesUseCase getUserPropertiesUseCase;
  final DeletePropertyUseCase deletePropertyUseCase;

  MyPropertiesNotifier({
    required this.getUserPropertiesUseCase,
    required this.deletePropertyUseCase,
  }) : super(const MyPropertiesState());

  Future<void> loadProperties({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(
        status: MyPropertiesStatus.loading,
        currentPage: 1,
        hasMore: true,
      );
    } else if (state.status == MyPropertiesStatus.loading) {
      return; // Already loading
    } else {
      state = state.copyWith(status: MyPropertiesStatus.loading);
    }

    try {
      final properties = await getUserPropertiesUseCase.execute(
        page: refresh ? 1 : state.currentPage,
        limit: 20,
      );

      if (refresh) {
        state = state.copyWith(
          status: MyPropertiesStatus.success,
          properties: properties,
          currentPage: 1,
          hasMore: properties.length >= 20,
          errorMessage: '',
        );
      } else {
        state = state.copyWith(
          status: MyPropertiesStatus.success,
          properties: [...state.properties, ...properties],
          currentPage: state.currentPage + 1,
          hasMore: properties.length >= 20,
          errorMessage: '',
        );
      }
    } catch (error) {
      state = state.copyWith(
        status: MyPropertiesStatus.failure,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> loadMoreProperties() async {
    if (!state.hasMore || state.status == MyPropertiesStatus.loading) {
      return;
    }

    await loadProperties();
  }

  Future<void> deleteProperty(int propertyId) async {
    state = state.copyWith(
      status: MyPropertiesStatus.deleting,
      deletingPropertyId: propertyId,
    );

    try {
      await deletePropertyUseCase.execute(propertyId);

      // Remove the property from the list
      final updatedProperties = state.properties
          .where((property) => property.id != propertyId)
          .toList();

      state = state.copyWith(
        status: MyPropertiesStatus.success,
        properties: updatedProperties,
        deletingPropertyId: null,
        errorMessage: '',
      );
    } catch (error) {
      state = state.copyWith(
        status: MyPropertiesStatus.failure,
        errorMessage: error.toString(),
        deletingPropertyId: null,
      );
    }
  }

  void clearError() {
    state = state.copyWith(
      status: MyPropertiesStatus.success,
      errorMessage: '',
    );
  }

  void addProperty(PropertyEntity property) {
    final updatedProperties = [property, ...state.properties];
    state = state.copyWith(
      properties: updatedProperties,
    );
  }
}