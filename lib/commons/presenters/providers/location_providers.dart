import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/constants/enums.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import 'package:trees_india/commons/utils/services/location_controller.dart';
import 'package:trees_india/commons/utils/services/location_service.dart';
import 'package:trees_india/commons/utils/services/location_state.dart';

final locationServiceProvider = Provider<LocationService>((ref) {
  return LocationService();
})
  ..registerProvider();

// final locationInitProvider = StateNotifierProvider<LocationInitNotifier, bool>(
//   (ref) => LocationInitNotifier(
//     ref.watch(locationServiceProvider),
//   ),
// )..registerProvider();

final locationControllerProvider =
    StateNotifierProvider<LocationController, LocationState>(
  (ref) => LocationController(ref),
)..registerProvider();

// Simple provider to get current location coordinates
final currentLocationProvider =
    Provider<({double latitude, double longitude})?>(
  (ref) {
    final locationState = ref.watch(locationControllerProvider);
    if (locationState.latitude == null || locationState.longitude == null) {
      return null;
    }
    return (
      latitude: locationState.latitude!,
      longitude: locationState.longitude!
    );
  },
);

// Provider to check if the location is available
final isLocationAvailableProvider = Provider<bool>((ref) {
  final locationState = ref.watch(locationControllerProvider);
  return locationState.status == LocationStatus.available;
});

// Provider to check if the location service is disabled
final isLocationServiceDisabledProvider = Provider<bool>((ref) {
  final locationState = ref.watch(locationControllerProvider);
  return locationState.status == LocationStatus.serviceDisabled;
});

// Provider to check if permission is denied
final isLocationPermissionDeniedProvider = Provider<bool>((ref) {
  final locationState = ref.watch(locationControllerProvider);
  return locationState.status == LocationStatus.permissionDenied ||
      locationState.status == LocationStatus.permissionDeniedForever;
});
