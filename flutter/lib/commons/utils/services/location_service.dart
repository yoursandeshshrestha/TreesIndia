import 'dart:async';
import 'dart:io';

import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';

class LocationService {
  // COMMENTED OUT FOR DEVELOPMENT SPEED
  // Future<bool> checkAndRequestPermission() async {
  //   bool serviceEnabled;
  //   LocationPermission permission;

  //   try {
  //     serviceEnabled = await Geolocator.isLocationServiceEnabled();
  //     if (!serviceEnabled) {
  //       return false;
  //     }

  //     permission = await Geolocator.checkPermission();
  //     if (permission == LocationPermission.denied) {
  //       permission = await Geolocator.requestPermission();
  //       if (permission == LocationPermission.denied) {
  //         return false;
  //       }
  //     }

  //     if (permission == LocationPermission.deniedForever) {
  //       return false;
  //     }

  //     return true;
  //   } catch (e) {
  //     print('Permission Check Error: $e');
  //     return false;
  //   }
  // }

  // DEVELOPMENT VERSION - Always returns true to skip permission checks
  Future<bool> checkAndRequestPermission() async {
    // Skip permission checks for development speed
    await Future.delayed(const Duration(milliseconds: 50));
    return true;
  }

  // Check if permission is already granted without requesting it
  Future<bool> _isLocationPermissionGranted() async {
    bool serviceEnabled;
    LocationPermission permission;

    try {
      serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return false;
      }

      permission = await Geolocator.checkPermission();
      return permission == LocationPermission.always ||
          permission == LocationPermission.whileInUse;
    } catch (e) {
      print('Permission Check Error: $e');
      return false;
    }
  }

  Future<(Position?, Placemark?)>
      _getCurrentPositionAndPlacemarkIfAllowed() async {
    // Check if permission is already granted without requesting
    bool hasPermission = await _isLocationPermissionGranted();
    if (!hasPermission) {
      return (null, null);
    }

    try {
      final LocationSettings locationSettings = Platform.isAndroid
          ? AndroidSettings(
              accuracy: LocationAccuracy.best,
              distanceFilter: 0,
              forceLocationManager: true,
              intervalDuration: const Duration(seconds: 5),
            )
          : AppleSettings(
              accuracy: LocationAccuracy.best,
              activityType: ActivityType.fitness,
              distanceFilter: 0,
              pauseLocationUpdatesAutomatically: true,
            );

      final Position position = await Geolocator.getCurrentPosition(
        locationSettings: locationSettings,
      );

      List<Placemark> placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      if (placemarks.isEmpty) {
        return (position, null);
      }

      return (position, placemarks[0]);
    } catch (e) {
      print('Location Error: $e');
      return (null, null);
    }
  }

  // Future<bool> _handleLocationPermission() async {
  //   bool serviceEnabled;
  //   LocationPermission permission;

  //   // Test if location services are enabled
  //   serviceEnabled = await Geolocator.isLocationServiceEnabled();
  //   if (!serviceEnabled) {
  //     throw Exception(
  //         'Location services are disabled. Please enable them in your device settings.');
  //   }

  //   permission = await Geolocator.checkPermission();
  //   if (permission == LocationPermission.denied) {
  //     permission = await Geolocator.requestPermission();
  //     if (permission == LocationPermission.denied) {
  //       throw Exception(
  //           'Location permissions are denied. Please enable them to use this feature.');
  //     }
  //   }

  //   if (permission == LocationPermission.deniedForever) {
  //     throw Exception(
  //         'Location permissions are permanently denied. Please enable them in your device settings.');
  //   }

  //   return true;
  // }

  // Get location with coordinates for geo tagging
  Future<String> getGeoTaggingLocation() async {
    try {
      final (position, place) =
          await _getCurrentPositionAndPlacemarkIfAllowed();

      if (position == null || place == null) {
        return '';
      }

      String locationString = _formatDetailedAddressWithLatLng(place, position);

      print(
          'Debug - Raw Position: ${position.latitude}, ${position.longitude}');
      print('Debug - Raw Placemark: ${place.toString()}');

      return locationString;
    } catch (e) {
      print('Location Error: $e');
      rethrow;
    }
  }

  Future<String> getLocation() async {
    try {
      final (_, place) = await _getCurrentPositionAndPlacemarkIfAllowed();

      if (place == null) {
        return '';
      }

      return _formatDetailedAddress(place);
    } catch (e) {
      print('Location Error: $e');
      rethrow;
    }
  }

  String _formatDetailedAddressWithLatLng(Placemark place, Position position) {
    final locationName = _formatDetailedAddress(place);

    return '$locationName#${position.latitude}#${position.longitude}';
  }

  String _formatDetailedAddress(Placemark place) {
    List<String> addressParts = [];

    if (place.subLocality?.isNotEmpty ?? false) {
      addressParts.add(place.subLocality!);
    }
    if (place.locality?.isNotEmpty ?? false) addressParts.add(place.locality!);
    if (place.subAdministrativeArea?.isNotEmpty ?? false) {
      addressParts.add(place.subAdministrativeArea!);
    }
    if (place.administrativeArea?.isNotEmpty ?? false) {
      addressParts.add(place.administrativeArea!);
    }
    if (place.country?.isNotEmpty ?? false) addressParts.add(place.country!);

    String locationName = addressParts.join(', ');

    return locationName;
  }

  //will return the geo location of the user

  // COMMENTED OUT FOR DEVELOPMENT SPEED
  // Future<(double latitude, double longitude)> getCurrentCoordinates() async {
  //   final LocationSettings locationSettings = Platform.isAndroid
  //       ? AndroidSettings(
  //           accuracy: LocationAccuracy.best,
  //           distanceFilter: 0,
  //           forceLocationManager: true,
  //           intervalDuration: const Duration(seconds: 5),
  //         )
  //       : AppleSettings(
  //           accuracy: LocationAccuracy.best,
  //           activityType: ActivityType.fitness,
  //           distanceFilter: 0,
  //           pauseLocationUpdatesAutomatically: true,
  //         );

  //   final Position position = await Geolocator.getCurrentPosition(
  //     locationSettings: locationSettings,
  //   );
  //   position.latitude;
  //   position.longitude;
  //   return (position.latitude, position.longitude);
  // }

  // DEVELOPMENT VERSION - Returns mock coordinates
  Future<(double latitude, double longitude)> getCurrentCoordinates() async {
    // Return mock coordinates for development speed
    await Future.delayed(const Duration(milliseconds: 100));
    return (0.0, 0.0); // Mock coordinates
  }

  Stream<Position> getPositionStream() {
    final LocationSettings locationSettings = Platform.isAndroid
        ? AndroidSettings(
            accuracy: LocationAccuracy.best,
            distanceFilter: 0,
            forceLocationManager: true,
            intervalDuration: const Duration(seconds: 5),
          )
        : AppleSettings(
            accuracy: LocationAccuracy.best,
            activityType: ActivityType.fitness,
            distanceFilter: 0,
            pauseLocationUpdatesAutomatically: true,
          );

    return Geolocator.getPositionStream(locationSettings: locationSettings);
  }
}
