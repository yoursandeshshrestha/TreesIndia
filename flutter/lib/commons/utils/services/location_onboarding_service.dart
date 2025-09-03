import 'dart:convert';
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
      final locationData = await _localStorage.getData(_locationKey);
      if (locationData != null && locationData is String) {
        final json = jsonDecode(locationData);
        return LocationModel.fromJson(json).toEntity();
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<void> saveLocation(LocationEntity location) async {
    try {
      final locationModel = LocationModel.fromEntity(location);
      final jsonString = jsonEncode(locationModel.toJson());
      await _localStorage.saveData(_locationKey, jsonString);
    } catch (e) {
      throw Exception('Failed to save location: $e');
    }
  }

  // COMMENTED OUT FOR DEVELOPMENT SPEED
  // Future<LocationEntity> getCurrentLocation() async {
  //   try {
  //     // First check and request location permission
  //     final hasPermission = await _locationService.checkAndRequestPermission();
  //     if (!hasPermission) {
  //       throw Exception('Location permission denied');
  //     }

  //     // Get current coordinates
  //     final coordinates = await _locationService.getCurrentCoordinates();

  //     // Get address from coordinates using geocoding
  //     final placemarks = await placemarkFromCoordinates(
  //       coordinates.$1,
  //       coordinates.$2,
  //     );

  //     if (placemarks.isEmpty) {
  //       throw Exception('Unable to get address from current location');
  //     }

  //     final placemark = placemarks.first;
  //     final address = _formatDetailedAddress(placemark);

  //     return LocationEntity(
  //       address: address,
  //       latitude: coordinates.$1,
  //       longitude: coordinates.$2,
  //       city: placemark.locality,
  //       state: placemark.administrativeArea,
  //       country: placemark.country ?? 'Unknown',
  //     );
  //   } catch (e) {
  //     throw Exception('Failed to get current location: $e');
  //   }
  // }

  // DEVELOPMENT VERSION - Returns mock location
  Future<LocationEntity> getCurrentLocation() async {
    // Return a mock location for development speed
    await Future.delayed(const Duration(milliseconds: 100)); // Minimal delay

    return const LocationEntity(
      address: 'Development Location',
      latitude: 0.0,
      longitude: 0.0,
      city: 'Dev City',
      state: 'Dev State',
      country: 'Dev Country',
    );
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
