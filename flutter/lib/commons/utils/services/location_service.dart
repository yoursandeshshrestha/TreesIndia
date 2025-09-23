import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';

class LocationService {
  Future<bool> checkAndRequestPermission() async {
    bool serviceEnabled;
    LocationPermission permission;

    try {
      serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return false;
      }

      permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return false;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return false;
      }

      return true;
    } catch (e) {
      print('Permission Check Error: $e');
      return false;
    }
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
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          debugPrint('⏰ [LocationService] GPS acquisition timed out after 30 seconds in _getCurrentPositionAndPlacemarkIfAllowed');
          throw TimeoutException('GPS location acquisition timed out', const Duration(seconds: 30));
        },
      );

      List<Placemark> placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      ).timeout(
        const Duration(seconds: 15),
        onTimeout: () {
          debugPrint('⏰ [LocationService] Reverse geocoding timed out after 15 seconds in _getCurrentPositionAndPlacemarkIfAllowed');
          throw TimeoutException('Reverse geocoding timed out', const Duration(seconds: 15));
        },
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

  Future<(double latitude, double longitude)> getCurrentCoordinates() async {
    debugPrint('🛰️ [LocationService] Starting getCurrentCoordinates...');
    final startTime = DateTime.now();

    debugPrint('🛰️ [LocationService] Configuring location settings...');
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

    debugPrint('🛰️ [LocationService] Location settings: Platform=${Platform.isAndroid ? 'Android' : 'iOS'}, Accuracy=best');
    debugPrint('🛰️ [LocationService] Calling Geolocator.getCurrentPosition...');
    final gpsStartTime = DateTime.now();

    final Position position = await Geolocator.getCurrentPosition(
      locationSettings: locationSettings,
    ).timeout(
      const Duration(seconds: 30),
      onTimeout: () {
        debugPrint('⏰ [LocationService] GPS acquisition timed out after 30 seconds');
        throw TimeoutException('GPS location acquisition timed out', const Duration(seconds: 30));
      },
    );

    final gpsDuration = DateTime.now().difference(gpsStartTime);
    final totalDuration = DateTime.now().difference(startTime);

    debugPrint('🛰️ [LocationService] GPS acquisition completed in ${gpsDuration.inMilliseconds}ms');
    debugPrint('🛰️ [LocationService] Coordinates: ${position.latitude}, ${position.longitude}');
    debugPrint('✅ [LocationService] getCurrentCoordinates completed in ${totalDuration.inMilliseconds}ms total');

    return (position.latitude, position.longitude);
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
