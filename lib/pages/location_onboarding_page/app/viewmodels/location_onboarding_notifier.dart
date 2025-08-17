import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/domain/entities/location_entity.dart';
import '../../../../commons/utils/services/location_onboarding_service.dart';
import 'location_onboarding_state.dart';

class LocationOnboardingNotifier extends StateNotifier<LocationOnboardingState> {
  final LocationOnboardingService _locationService;

  LocationOnboardingNotifier(this._locationService) : super(LocationOnboardingInitial());

  Future<void> searchLocations(String query) async {
    if (query.trim().isEmpty) {
      state = LocationOnboardingInitial();
      return;
    }

    state = LocationOnboardingLoading();
    try {
      final locations = await _locationService.searchLocations(query);
      state = LocationOnboardingSearchResults(locations);
    } catch (e) {
      state = LocationOnboardingError('Failed to search locations: ${e.toString()}');
    }
  }

  Future<void> getCurrentLocation() async {
    state = LocationOnboardingLoading();
    try {
      final location = await _locationService.getCurrentLocation();
      await _locationService.saveLocation(location);
      await _locationService.markFirstLoginComplete();
      state = LocationOnboardingLocationSaved(location);
    } catch (e) {
      if (e.toString().contains('permission')) {
        state = LocationOnboardingPermissionDenied();
      } else {
        state = LocationOnboardingError('Failed to get current location: ${e.toString()}');
      }
    }
  }

  Future<void> saveLocationAndComplete(LocationEntity location) async {
    state = LocationOnboardingLoading();
    try {
      await _locationService.saveLocation(location);
      await _locationService.markFirstLoginComplete();
      state = LocationOnboardingLocationSaved(location);
    } catch (e) {
      state = LocationOnboardingError('Failed to save location: ${e.toString()}');
    }
  }

  void clearState() {
    state = LocationOnboardingInitial();
  }
}