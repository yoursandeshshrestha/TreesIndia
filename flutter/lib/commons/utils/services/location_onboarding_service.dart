import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:geocoding/geocoding.dart';
import '../../data/models/location_model.dart';
import '../../domain/entities/location_entity.dart';
import '../../domain/repositories/centralized_data_repository.dart';
import 'centralized_local_storage_service.dart';
import 'location_service.dart';

class LocationOnboardingService {
  static const String _locationKey = 'user_selected_location';
  static const String _firstLoginKey = 'is_first_login';

  final CentralizedLocalStorageService _localStorage;
  final LocationService _locationService;
  final CentralizedDataRepository _dataRepository;

  LocationOnboardingService(
    this._localStorage,
    this._locationService,
    this._dataRepository,
  );

  Future<bool> isFirstLogin() async {
    try {
      final isFirstLogin = await _localStorage.getData(_firstLoginKey);
      // For testing: uncomment the line below to always show location onboarding
      // return true;
      return isFirstLogin == null || isFirstLogin == true;
    } catch (e) {
      return true;
    }
  }

  Future<void> markFirstLoginComplete() async {
    await _localStorage.saveData(_firstLoginKey, false);
  }

  Future<LocationEntity?> getSavedLocation() async {
    try {
      debugPrint('💾 [LocationService] Getting saved location from storage...');
      final startTime = DateTime.now();
      final locationData = await _localStorage.getData(_locationKey);
      final duration = DateTime.now().difference(startTime);
      debugPrint('💾 [LocationService] Storage read completed in ${duration.inMilliseconds}ms');

      if (locationData != null && locationData is String) {
        debugPrint('💾 [LocationService] Found saved location data, parsing JSON...');
        final parseStartTime = DateTime.now();
        final json = jsonDecode(locationData);
        final entity = LocationModel.fromJson(json).toEntity();
        final parseDuration = DateTime.now().difference(parseStartTime);
        debugPrint('💾 [LocationService] JSON parsing completed in ${parseDuration.inMilliseconds}ms');
        debugPrint('💾 [LocationService] Saved location: ${entity.city}, ${entity.state}');
        return entity;
      }
      debugPrint('💾 [LocationService] No saved location found');
      return null;
    } catch (e) {
      debugPrint('❌ [LocationService] Error getting saved location: $e');
      debugPrint('❌ [LocationService] Error type: ${e.runtimeType}');
      return null;
    }
  }

  Future<void> saveLocation(LocationEntity location) async {
    try {
      debugPrint('💾 [LocationService] Saving location: ${location.city}, ${location.state}');
      final startTime = DateTime.now();

      debugPrint('💾 [LocationService] Converting entity to model...');
      final modelConvertStartTime = DateTime.now();
      final locationModel = LocationModel.fromEntity(location);
      final modelConvertDuration = DateTime.now().difference(modelConvertStartTime);
      debugPrint('💾 [LocationService] Entity conversion completed in ${modelConvertDuration.inMilliseconds}ms');

      debugPrint('💾 [LocationService] Encoding to JSON...');
      final jsonStartTime = DateTime.now();
      final jsonString = jsonEncode(locationModel.toJson());
      final jsonDuration = DateTime.now().difference(jsonStartTime);
      debugPrint('💾 [LocationService] JSON encoding completed in ${jsonDuration.inMilliseconds}ms');

      debugPrint('💾 [LocationService] Writing to storage...');
      final storageStartTime = DateTime.now();
      await _localStorage.saveData(_locationKey, jsonString);
      final storageDuration = DateTime.now().difference(storageStartTime);
      debugPrint('💾 [LocationService] Storage write completed in ${storageDuration.inMilliseconds}ms');

      final totalDuration = DateTime.now().difference(startTime);
      debugPrint('✅ [LocationService] Location saved successfully in ${totalDuration.inMilliseconds}ms total');
    } catch (e) {
      debugPrint('❌ [LocationService] Failed to save location: $e');
      debugPrint('❌ [LocationService] Error type: ${e.runtimeType}');
      throw Exception('Failed to save location: $e');
    }
  }

  Future<LocationEntity> getCurrentLocation() async {
    try {
      // First check and request location permission
      final hasPermission = await _locationService.checkAndRequestPermission();
      if (!hasPermission) {
        throw Exception('Location permission denied');
      }

      // Get current coordinates
      final coordinates = await _locationService.getCurrentCoordinates();

      // Get address from coordinates using geocoding
      final placemarks = await placemarkFromCoordinates(
        coordinates.$1,
        coordinates.$2,
      ).timeout(
        const Duration(seconds: 15),
        onTimeout: () {
          debugPrint('⏰ [LocationService] Reverse geocoding timed out after 15 seconds in getCurrentLocation');
          throw TimeoutException('Reverse geocoding timed out', const Duration(seconds: 15));
        },
      );

      if (placemarks.isEmpty) {
        throw Exception('Unable to get address from current location');
      }

      final placemark = placemarks.first;
      final address = _formatDetailedAddress(placemark);

      return LocationEntity(
        address: address,
        latitude: coordinates.$1,
        longitude: coordinates.$2,
        city: placemark.locality,
        state: placemark.administrativeArea,
        country: placemark.country ?? 'Unknown',
        postalCode: placemark.postalCode,
      );
    } catch (e) {
      throw Exception('Failed to get current location: $e');
    }
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

    return addressParts.isNotEmpty
        ? addressParts.join(', ')
        : 'Unknown Location';
  }

  Future<List<LocationEntity>> searchLocations(String query) async {
    if (query.trim().isEmpty) {
      return [];
    }

    try {
      return await _dataRepository.searchLocations(query);
    } catch (e) {
      // Fallback to mock data if API fails
      await Future.delayed(const Duration(milliseconds: 500));

      final mockResults = [
        LocationEntity(
          address: '$query, Sample City, Sample State',
          latitude: 37.7749 + (query.length * 0.001),
          longitude: -122.4194 + (query.length * 0.001),
          city: 'Sample City',
          state: 'Sample State',
          country: 'Sample Country',
        ),
        LocationEntity(
          address: '$query Downtown, Sample City, Sample State',
          latitude: 37.7849 + (query.length * 0.001),
          longitude: -122.4094 + (query.length * 0.001),
          city: 'Sample City',
          state: 'Sample State',
          country: 'Sample Country',
        ),
        LocationEntity(
          address: '$query Area, Another City, Sample State',
          latitude: 37.7949 + (query.length * 0.001),
          longitude: -122.3994 + (query.length * 0.001),
          city: 'Another City',
          state: 'Sample State',
          country: 'Sample Country',
        ),
      ];

      return mockResults;
    }
  }

  Future<void> clearLocationData() async {
    await _localStorage.deleteData(_locationKey);
    await _localStorage.deleteData(_firstLoginKey);
  }
}
