import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:trees_india/commons/constants/enums.dart';
import 'package:trees_india/commons/utils/services/location_service.dart';
import 'package:trees_india/commons/utils/services/location_state.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

class LocationController extends StateNotifier<LocationState> {
  LocationController(this.ref)
      : super(const LocationState(status: LocationStatus.initial)) {
    _init();
  }

  final Ref ref;
  StreamSubscription<Position>? _positionSubscription;
  final _locationService = LocationService();
  bool _requestingPermission = false;

  void _init() async {
    try {
      // First check if location service is enabled on device
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        state = state.copyWith(status: LocationStatus.serviceDisabled);
        return;
      }

      // Check current permission
      await _checkPermissionAndUpdateState();
    } catch (e) {
      if (kDebugMode) {
        print('Error initializing location: $e');
      }
      state = state.copyWith(status: LocationStatus.permissionDenied);
    }
  }

  // Add this to your LocationController class
  Future<void> reinitializeLocation() async {
    // Reset to initial state
    state = const LocationState(status: LocationStatus.initial);

    // Cancel existing subscriptions
    _positionSubscription?.cancel();
    _positionSubscription = null;

    // Reinitialize everything
    _init();
  }

  Future<void> _checkPermissionAndUpdateState() async {
    final permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      state = state.copyWith(status: LocationStatus.permissionDenied);
      return;
    }

    if (permission == LocationPermission.deniedForever) {
      state = state.copyWith(status: LocationStatus.permissionDeniedForever);
      return;
    }

    if (permission == LocationPermission.whileInUse ||
        permission == LocationPermission.always) {
      await _startLocationTracking();
    }
  }

  Future<void> _startLocationTracking() async {
    try {
      // Get initial position
      final coordinates = await _locationService.getCurrentCoordinates();
      state = LocationState(
        latitude: coordinates.$1,
        longitude: coordinates.$2,
        status: LocationStatus.available,
      );

      // Start listening to position updates
      _positionSubscription =
          _locationService.getPositionStream().listen((Position position) {
        state = LocationState(
          latitude: position.latitude,
          longitude: position.longitude,
          status: LocationStatus.available,
        );
      });
    } catch (e) {
      if (kDebugMode) {
        print('Error tracking location: $e');
      }
      // If we get here, there might be an issue with the location service itself
      state = state.copyWith(status: LocationStatus.serviceDisabled);
    }
  }

  Future<bool> requestPermission() async {
    // Prevent multiple simultaneous requests
    if (_requestingPermission) return false;

    _requestingPermission = true;
    try {
      // First check if service is enabled
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        state = state.copyWith(status: LocationStatus.serviceDisabled);
        _requestingPermission = false;
        return false;
      }

      // Request permission
      final permission = await Geolocator.requestPermission();

      if (permission == LocationPermission.denied) {
        state = state.copyWith(status: LocationStatus.permissionDenied);
        _requestingPermission = false;
        return false;
      }

      if (permission == LocationPermission.deniedForever) {
        state = state.copyWith(status: LocationStatus.permissionDeniedForever);
        _requestingPermission = false;
        return false;
      }

      // Permission granted
      await _startLocationTracking();
      _requestingPermission = false;
      return true;
    } catch (e) {
      if (kDebugMode) {
        print('Error requesting permission: $e');
      }
      state = state.copyWith(status: LocationStatus.permissionDenied);
      _requestingPermission = false;
      return false;
    }
  }

  @override
  void dispose() {
    _positionSubscription?.cancel();
    super.dispose();
  }
}
