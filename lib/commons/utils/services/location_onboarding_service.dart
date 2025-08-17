import 'dart:convert';
import '../../data/models/location_model.dart';
import '../../domain/entities/location_entity.dart';
import 'centralized_local_storage_service.dart';

class LocationOnboardingService {
  static const String _locationKey = 'user_selected_location';
  static const String _firstLoginKey = 'is_first_login';

  final CentralizedLocalStorageService _localStorage;

  LocationOnboardingService(this._localStorage);

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

  Future<LocationEntity> getCurrentLocation() async {
    // For demo purposes, return a mock current location
    // In production, you would implement actual GPS location fetching here
    await Future.delayed(const Duration(seconds: 1)); // Simulate API delay

    return const LocationEntity(
      address: 'Matigara, Siliguri, West Bengal',
      latitude: 37.7749,
      longitude: -122.4194,
      city: 'Siliguri',
      state: 'West Bengal',
      country: 'India',
    );
  }

  Future<List<LocationEntity>> searchLocations(String query) async {
    if (query.trim().isEmpty) {
      return [];
    }

    // For demo purposes, return mock search results
    // In production, you would implement actual location search API here
    await Future.delayed(
        const Duration(milliseconds: 500)); // Simulate API delay

    // Mock search results based on query
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

  Future<void> clearLocationData() async {
    await _localStorage.deleteData(_locationKey);
    await _localStorage.deleteData(_firstLoginKey);
  }
}
