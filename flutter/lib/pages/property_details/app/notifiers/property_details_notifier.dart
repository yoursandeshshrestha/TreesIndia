import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import 'package:trees_india/pages/profile_page/app/views/menu_pages/my_properties/app/providers/property_providers.dart';
import '../../../profile_page/app/views/menu_pages/my_properties/domain/entities/property_entity.dart';
import '../../../profile_page/app/views/menu_pages/my_properties/domain/usecases/get_property_details_usecase.dart';

// Providers
final getPropertyDetailsUseCaseProvider =
    Provider<GetPropertyDetailsUseCase>((ref) {
  final repository = ref.read(propertyRepositoryProvider);
  return GetPropertyDetailsUseCase(repository);
});

final propertyDetailsNotifierProvider =
    StateNotifierProvider<PropertyDetailsNotifier, PropertyDetailsState>((ref) {
  final getPropertyDetailsUseCase =
      ref.watch(getPropertyDetailsUseCaseProvider);
  return PropertyDetailsNotifier(
      getPropertyDetailsUseCase: getPropertyDetailsUseCase);
})
      ..registerProvider();

enum PropertyDetailsStatus {
  initial,
  loading,
  success,
  failure,
}

class PropertyDetailsState {
  final PropertyDetailsStatus status;
  final PropertyEntity? property;
  final String? errorMessage;

  const PropertyDetailsState({
    this.status = PropertyDetailsStatus.initial,
    this.property,
    this.errorMessage,
  });

  PropertyDetailsState copyWith({
    PropertyDetailsStatus? status,
    PropertyEntity? property,
    String? errorMessage,
    bool clearError = false,
  }) {
    return PropertyDetailsState(
      status: status ?? this.status,
      property: property ?? this.property,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

class PropertyDetailsNotifier extends StateNotifier<PropertyDetailsState> {
  final GetPropertyDetailsUseCase getPropertyDetailsUseCase;

  PropertyDetailsNotifier({
    required this.getPropertyDetailsUseCase,
  }) : super(const PropertyDetailsState());

  Future<void> loadPropertyDetails(String propertyId) async {
    if (propertyId.isEmpty) {
      state = state.copyWith(
        status: PropertyDetailsStatus.failure,
        errorMessage: 'Vendor ID is required',
      );
      return;
    }

    state = const PropertyDetailsState(status: PropertyDetailsStatus.loading);

    try {
      final property = await getPropertyDetailsUseCase.execute(propertyId);
      state = state.copyWith(
        status: PropertyDetailsStatus.success,
        property: property,
        clearError: true,
      );
    } catch (e) {
      state = state.copyWith(
        status: PropertyDetailsStatus.failure,
        errorMessage: e.toString(),
      );
    }
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }

  void reset() {
    state = const PropertyDetailsState();
  }
}
