import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/domain/entities/location_entity.dart';
import '../../../../commons/utils/services/location_onboarding_service.dart';
import 'location_onboarding_state.dart';

class LocationOnboardingNotifier
    extends StateNotifier<LocationOnboardingState> {
  final LocationOnboardingService _locationService;
  Timer? _debounceTimer;
  static const int _debounceDelay = 300; // 300ms debounce
  static const int _minQueryLength = 3; // Minimum 3 characters

  LocationOnboardingNotifier(this._locationService)
      : super(LocationOnboardingInitial());

  Future<void> searchLocations(String query) async {
    // Cancel any existing timer
    _debounceTimer?.cancel();

    final trimmedQuery = query.trim();

    // Check if query is empty
    if (trimmedQuery.isEmpty) {
      state = LocationOnboardingInitial();
      return;
    }

    // Check minimum query length
    if (trimmedQuery.length < _minQueryLength) {
      state = LocationOnboardingInitial();
      return;
    }

    // Set up debounce timer
    _debounceTimer =
        Timer(const Duration(milliseconds: _debounceDelay), () async {
      await _performSearch(trimmedQuery);
    });
  }

  Future<void> _performSearch(String query) async {
    state = LocationOnboardingLoading();
    try {
      final locations = await _locationService.searchLocations(query);
      state = LocationOnboardingSearchResults(locations);
    } catch (e) {
      state = LocationOnboardingError(
          'Failed to search locations: ${e.toString()}');
    }
  }

  Future<void> getCurrentLocation({bool isFirstLogin = true}) async {
    state = LocationOnboardingLoading();
    try {
      final location = await _locationService.getCurrentLocation();
      await _locationService.saveLocation(location);
      if (isFirstLogin) {
        await _locationService.markFirstLoginComplete();
      }
      state = LocationOnboardingLocationSaved(location);
    } catch (e) {
      if (e.toString().contains('permission')) {
        state = LocationOnboardingPermissionDenied();
      } else {
        state = LocationOnboardingError(
            'Failed to get current location: ${e.toString()}');
      }
    }
  }

  Future<void> saveLocationAndComplete(LocationEntity location,
      {bool isFirstLogin = true}) async {
    state = LocationOnboardingLoading();
    try {
      await _locationService.saveLocation(location);
      if (isFirstLogin) {
        await _locationService.markFirstLoginComplete();
      }
      state = LocationOnboardingLocationSaved(location);
    } catch (e) {
      state =
          LocationOnboardingError('Failed to save location: ${e.toString()}');
    }
  }

  void clearState() {
    _debounceTimer?.cancel();
    state = LocationOnboardingInitial();
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }
}
