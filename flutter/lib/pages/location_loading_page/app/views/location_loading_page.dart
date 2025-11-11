import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import '../../../../commons/constants/app_colors.dart';
import '../../../../commons/constants/app_spacing.dart';
import '../../../../commons/domain/entities/location_entity.dart';
import '../../../../commons/presenters/providers/location_onboarding_provider.dart';

class LocationLoadingPage extends ConsumerStatefulWidget {
  const LocationLoadingPage({super.key});

  @override
  ConsumerState<LocationLoadingPage> createState() =>
      _LocationLoadingPageState();
}

class _LocationLoadingPageState extends ConsumerState<LocationLoadingPage>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  bool _isLocationSet = false;
  LocationEntity? _currentLocation;
  String _statusText = 'Fetching your location...';

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _fadeAnimation =
        Tween<double>(begin: 0.0, end: 1.0).animate(_fadeController);

    _initializeLocation();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  Future<void> _initializeLocation() async {
    try {
      final startTime = DateTime.now();
      debugPrint(
          '🚀 [LocationLoading] Starting location initialization at ${startTime.toIso8601String()}');

      final locationService = ref.read(locationOnboardingServiceProvider);

      // First check if we have a saved location
      debugPrint('📱 [LocationLoading] Checking for saved location...');
      final savedLocationStartTime = DateTime.now();
      final savedLocation = await locationService.getSavedLocation();
      final savedLocationDuration =
          DateTime.now().difference(savedLocationStartTime);
      debugPrint(
          '📱 [LocationLoading] Saved location check completed in ${savedLocationDuration.inMilliseconds}ms - Found: ${savedLocation != null}');

      if (savedLocation != null) {
        if (mounted) {
          setState(() {
            _currentLocation = savedLocation;
            _statusText = 'Using saved location';
          });
        }

        // Check if location permission is already granted (without requesting)
        debugPrint('🔒 [LocationLoading] Checking location permissions...');
        final permissionStartTime = DateTime.now();
        final hasPermission = await _checkLocationPermissionWithoutRequest();
        final permissionDuration =
            DateTime.now().difference(permissionStartTime);
        debugPrint(
            '🔒 [LocationLoading] Permission check completed in ${permissionDuration.inMilliseconds}ms - Has permission: $hasPermission');

        if (hasPermission) {
          // Try to update with current location if permission is already granted
          try {
            debugPrint(
                '📍 [LocationLoading] Permission granted - updating location with current GPS position');
            if (mounted) {
              setState(() {
                _statusText = 'Updating your location...';
              });
            }

            final currentLocationStartTime = DateTime.now();
            debugPrint(
                '📍 [LocationLoading] Starting getCurrentLocationDirectly() at ${currentLocationStartTime.toIso8601String()}');

            // Add timeout for the entire location update process
            final currentLocation = await _getCurrentLocationDirectly().timeout(
              const Duration(seconds: 15), // Max 15 seconds for location update
              onTimeout: () {
                debugPrint(
                    '⏰ [LocationLoading] Location update timed out after 15 seconds, keeping saved location');
                if (mounted) {
                  setState(() {
                    _statusText = 'Using saved location (update timed out)';
                  });
                }
                return null; // Return null to indicate timeout
              },
            );
            final currentLocationDuration =
                DateTime.now().difference(currentLocationStartTime);
            debugPrint(
                '📍 [LocationLoading] getCurrentLocationDirectly() completed in ${currentLocationDuration.inMilliseconds}ms (${(currentLocationDuration.inMilliseconds / 1000).toStringAsFixed(2)}s)');
            if (currentLocation != null) {
              debugPrint(
                  '💾 [LocationLoading] Saving updated location to storage...');
              final saveStartTime = DateTime.now();
              await locationService.saveLocation(currentLocation);
              final saveDuration = DateTime.now().difference(saveStartTime);
              debugPrint(
                  '💾 [LocationLoading] Location saved in ${saveDuration.inMilliseconds}ms');

              if (mounted) {
                setState(() {
                  _currentLocation = currentLocation;
                  _statusText = 'Location updated';
                });
              }
            } else {
              if (mounted) {
                setState(() {
                  _statusText = 'Using saved location';
                });
              }
            }
          } catch (e) {
            debugPrint('❌ [LocationLoading] Failed to update location: $e');
            debugPrint('❌ [LocationLoading] Error type: ${e.runtimeType}');
            // Keep using saved location if current location fails
            if (mounted) {
              setState(() {
                _statusText = 'Using saved location';
              });
            }
          }
        }
      } else {
        // No saved location, check if permission is granted
        debugPrint(
            '🔒 [LocationLoading] No saved location found, checking permissions...');
        final permissionStartTime = DateTime.now();
        final hasPermission = await _checkLocationPermissionWithoutRequest();
        final permissionDuration =
            DateTime.now().difference(permissionStartTime);
        debugPrint(
            '🔒 [LocationLoading] Permission check completed in ${permissionDuration.inMilliseconds}ms - Has permission: $hasPermission');

        if (hasPermission) {
          try {
            debugPrint(
                '📍 [LocationLoading] Permission granted - getting current location for first time');
            if (mounted) {
              setState(() {
                _statusText = 'Getting your current location...';
              });
            }

            final currentLocationStartTime = DateTime.now();
            debugPrint(
                '📍 [LocationLoading] Starting first-time getCurrentLocationDirectly() at ${currentLocationStartTime.toIso8601String()}');
            final currentLocation = await _getCurrentLocationDirectly().timeout(
              const Duration(
                  seconds: 20), // Give more time for first-time location
              onTimeout: () {
                debugPrint(
                    '⏰ [LocationLoading] First-time location acquisition timed out after 20 seconds');
                if (mounted) {
                  setState(() {
                    _statusText = 'Location service unavailable, using default';
                  });
                }
                return null;
              },
            );
            final currentLocationDuration =
                DateTime.now().difference(currentLocationStartTime);
            debugPrint(
                '📍 [LocationLoading] First-time getCurrentLocationDirectly() completed in ${currentLocationDuration.inMilliseconds}ms (${(currentLocationDuration.inMilliseconds / 1000).toStringAsFixed(2)}s)');
            if (currentLocation != null) {
              debugPrint(
                  '💾 [LocationLoading] Saving first-time location to storage...');
              final saveStartTime = DateTime.now();
              await locationService.saveLocation(currentLocation);
              final saveDuration = DateTime.now().difference(saveStartTime);
              debugPrint(
                  '💾 [LocationLoading] First-time location saved in ${saveDuration.inMilliseconds}ms');

              if (mounted) {
                setState(() {
                  _currentLocation = currentLocation;
                  _statusText = 'Location found';
                });
              }
            } else {
              throw Exception('Could not get current location');
            }
          } catch (e) {
            debugPrint(
                '❌ [LocationLoading] Failed to get current location: $e');
            debugPrint('❌ [LocationLoading] Error type: ${e.runtimeType}');
            // Use a default location as fallback
            if (mounted) {
              setState(() {
                _statusText = 'Using default location';
                _currentLocation = const LocationEntity(
                  address: 'Default Location',
                  latitude: 0.0,
                  longitude: 0.0,
                  city: 'Unknown',
                  state: 'Unknown',
                  country: 'Unknown',
                );
              });
            }
            if (_currentLocation != null) {
              await locationService.saveLocation(_currentLocation!);
            }
          }
        } else {
          // No permission and no saved location - use default
          debugPrint(
              '🚫 [LocationLoading] No permission and no saved location - using default location');
          if (mounted) {
            setState(() {
              _statusText = 'Using default location';
              _currentLocation = const LocationEntity(
                address: 'Default Location',
                latitude: 0.0,
                longitude: 0.0,
                city: 'Unknown',
                state: 'Unknown',
                country: 'Unknown',
              );
            });
          }
          if (_currentLocation != null) {
            debugPrint(
                '💾 [LocationLoading] Saving default location to storage...');
            final saveStartTime = DateTime.now();
            await locationService.saveLocation(_currentLocation!);
            final saveDuration = DateTime.now().difference(saveStartTime);
            debugPrint(
                '💾 [LocationLoading] Default location saved in ${saveDuration.inMilliseconds}ms');
          }
        }
      }

      // Mark first login as complete
      debugPrint('✅ [LocationLoading] Marking first login as complete...');
      final markCompleteStartTime = DateTime.now();
      await locationService.markFirstLoginComplete();
      final markCompleteDuration =
          DateTime.now().difference(markCompleteStartTime);
      debugPrint(
          '✅ [LocationLoading] First login marked complete in ${markCompleteDuration.inMilliseconds}ms');

      // Show location found animation
      debugPrint('🎬 [LocationLoading] Starting success animation sequence...');
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        setState(() {
          _isLocationSet = true;
        });

        _fadeController.forward();
      }

      // Navigate to home after showing the success animation
      debugPrint(
          '🎬 [LocationLoading] Animation complete, navigating to home in 3 seconds...');
      await Future.delayed(const Duration(seconds: 3));
      if (mounted) {
        final totalDuration = DateTime.now().difference(startTime);
        debugPrint(
            '🏁 [LocationLoading] Total initialization completed in ${totalDuration.inMilliseconds}ms (${(totalDuration.inMilliseconds / 1000).toStringAsFixed(2)}s)');
        debugPrint('🏠 [LocationLoading] Navigating to home page');
        context.go('/home');
      }
    } catch (e) {
      debugPrint(
          '💥 [LocationLoading] Critical error in location initialization: $e');
      debugPrint('💥 [LocationLoading] Error type: ${e.runtimeType}');
      debugPrint('💥 [LocationLoading] Stack trace: ${StackTrace.current}');
      // Fallback - go to home anyway
      if (mounted) {
        debugPrint(
            '🏠 [LocationLoading] Fallback - navigating to home due to error');
        context.go('/home');
      }
    }
  }

  // Check location permission without requesting it
  Future<bool> _checkLocationPermissionWithoutRequest() async {
    try {
      // Check if location service is enabled
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return false;
      }

      // Check current permission status without requesting
      final permission = await Geolocator.checkPermission();
      return permission == LocationPermission.always ||
          permission == LocationPermission.whileInUse;
    } catch (e) {
      debugPrint('Error checking location permission: $e');
      return false;
    }
  }

  // Get current location directly without permission request
  Future<LocationEntity?> _getCurrentLocationDirectly() async {
    try {
      debugPrint('🛰️ [LocationLoading] Starting GPS location acquisition...');

      // First try to get last known location (much faster)
      debugPrint(
          '⚡ [LocationLoading] Attempting to get last known location...');
      final lastKnownStartTime = DateTime.now();
      try {
        final lastKnownPosition = await Geolocator.getLastKnownPosition();
        final lastKnownDuration = DateTime.now().difference(lastKnownStartTime);
        debugPrint(
            '⚡ [LocationLoading] Last known location check completed in ${lastKnownDuration.inMilliseconds}ms');

        if (lastKnownPosition != null) {
          // Check if last known location is recent enough (within 10 minutes)
          final locationAge = DateTime.now().millisecondsSinceEpoch -
              lastKnownPosition.timestamp.millisecondsSinceEpoch;
          final ageInMinutes = locationAge / (1000 * 60);

          debugPrint(
              '⚡ [LocationLoading] Last known location found - Age: ${ageInMinutes.toStringAsFixed(1)} minutes');

          if (ageInMinutes <= 10) {
            debugPrint(
                '⚡ [LocationLoading] Using recent last known location (${ageInMinutes.toStringAsFixed(1)} min old)');
            debugPrint(
                '⚡ [LocationLoading] Last known coordinates: ${lastKnownPosition.latitude}, ${lastKnownPosition.longitude}');

            // Use last known location for faster response
            final geocodingStartTime = DateTime.now();
            debugPrint(
                '🌍 [LocationLoading] Starting reverse geocoding for last known location...');

            final placemarks = await placemarkFromCoordinates(
              lastKnownPosition.latitude,
              lastKnownPosition.longitude,
            ).timeout(
              const Duration(seconds: 15),
              onTimeout: () {
                debugPrint(
                    '⏰ [LocationLoading] Reverse geocoding timed out after 15 seconds');
                throw TimeoutException(
                    'Reverse geocoding timed out', const Duration(seconds: 15));
              },
            );

            final geocodingDuration =
                DateTime.now().difference(geocodingStartTime);
            debugPrint(
                '🌍 [LocationLoading] Reverse geocoding completed in ${geocodingDuration.inMilliseconds}ms');

            if (placemarks.isNotEmpty) {
              final placemark = placemarks.first;
              debugPrint(
                  '🌍 [LocationLoading] Processing placemark: ${placemark.locality}, ${placemark.administrativeArea}, ${placemark.country}');
              final address = _formatDetailedAddress(placemark);

              final locationEntity = LocationEntity(
                address: address,
                latitude: lastKnownPosition.latitude,
                longitude: lastKnownPosition.longitude,
                city: placemark.locality,
                state: placemark.administrativeArea,
                country: placemark.country ?? 'Unknown',
              );

              debugPrint(
                  '✅ [LocationLoading] Location entity created from last known position: $address');
              return locationEntity;
            }
          } else {
            debugPrint(
                '⚡ [LocationLoading] Last known location too old (${ageInMinutes.toStringAsFixed(1)} min), getting fresh location');
          }
        } else {
          debugPrint(
              '⚡ [LocationLoading] No last known location available, getting fresh location');
        }
      } catch (e) {
        debugPrint(
            '⚡ [LocationLoading] Error getting last known location: $e, falling back to fresh location');
      }

      // Fallback to fresh GPS location
      debugPrint('🛰️ [LocationLoading] Getting fresh GPS location...');
      // Get current position using proper LocationSettings
      final LocationSettings locationSettings = Platform.isAndroid
          ? AndroidSettings(
              accuracy: LocationAccuracy
                  .low, // Changed from medium to low for faster acquisition
              distanceFilter:
                  100, // Allow 100m difference to use cached location
              forceLocationManager:
                  false, // Use Google Play Services instead of GPS manager for faster results
              intervalDuration: const Duration(seconds: 5), // Reduced interval
            )
          : AppleSettings(
              accuracy: LocationAccuracy
                  .reduced, // Use reduced accuracy for faster results
              activityType: ActivityType.other, // Generic activity type
              distanceFilter: 100,
              pauseLocationUpdatesAutomatically: true,
            );

      debugPrint(
          '🛰️ [LocationLoading] GPS settings configured - Platform: ${Platform.isAndroid ? 'Android' : 'iOS'}, Accuracy: ${Platform.isAndroid ? 'low' : 'reduced'} (optimized for speed)');
      final gpsStartTime = DateTime.now();
      debugPrint(
          '🛰️ [LocationLoading] Calling Geolocator.getCurrentPosition() at ${gpsStartTime.toIso8601String()}');

      final position = await Geolocator.getCurrentPosition(
        locationSettings: locationSettings,
      ).timeout(
        const Duration(
            seconds:
                10), // Reduced timeout to 10 seconds since we have saved location fallback
        onTimeout: () {
          debugPrint(
              '⏰ [LocationLoading] Fresh GPS acquisition timed out after 10 seconds - will use saved location');
          throw TimeoutException('GPS location acquisition timed out',
              const Duration(seconds: 10));
        },
      );

      final gpsDuration = DateTime.now().difference(gpsStartTime);
      debugPrint(
          '🛰️ [LocationLoading] GPS position acquired in ${gpsDuration.inMilliseconds}ms (${(gpsDuration.inMilliseconds / 1000).toStringAsFixed(2)}s)');
      debugPrint(
          '🛰️ [LocationLoading] GPS coordinates: ${position.latitude}, ${position.longitude}');

      // Get address from coordinates using geocoding
      debugPrint('🌍 [LocationLoading] Starting reverse geocoding...');
      final geocodingStartTime = DateTime.now();
      final placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      ).timeout(
        const Duration(seconds: 15),
        onTimeout: () {
          debugPrint(
              '⏰ [LocationLoading] Reverse geocoding timed out after 15 seconds');
          throw TimeoutException(
              'Reverse geocoding timed out', const Duration(seconds: 15));
        },
      );
      final geocodingDuration = DateTime.now().difference(geocodingStartTime);
      debugPrint(
          '🌍 [LocationLoading] Reverse geocoding completed in ${geocodingDuration.inMilliseconds}ms (${(geocodingDuration.inMilliseconds / 1000).toStringAsFixed(2)}s)');
      debugPrint(
          '🌍 [LocationLoading] Found ${placemarks.length} placemark(s)');

      if (placemarks.isEmpty) {
        debugPrint('🌍 [LocationLoading] No placemarks found for coordinates');
        return null;
      }

      final placemark = placemarks.first;
      debugPrint(
          '🌍 [LocationLoading] Processing placemark: ${placemark.locality}, ${placemark.administrativeArea}, ${placemark.country}');
      final address = _formatDetailedAddress(placemark);

      final locationEntity = LocationEntity(
        address: address,
        latitude: position.latitude,
        longitude: position.longitude,
        city: placemark.locality,
        state: placemark.administrativeArea,
        country: placemark.country ?? 'Unknown',
      );

      debugPrint(
          '✅ [LocationLoading] Location entity created successfully: $address');
      return locationEntity;
    } catch (e) {
      debugPrint('❌ [LocationLoading] Error getting current location: $e');
      debugPrint('❌ [LocationLoading] Error type: ${e.runtimeType}');
      return null;
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

  String _getDisplayLocation(LocationEntity location) {
    if (location.city != null && location.state != null) {
      return '${location.city}, ${location.state}';
    }
    return location.address;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.brandNeutral50,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (!_isLocationSet) ...[
                  Lottie.asset(
                    "assets/lottie/location_fetching.json",
                    width: 300,
                    height: 300,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      if (kDebugMode) {
                        print('Location fetching animation error: $error');
                      }
                      return Container(
                        width: 300,
                        height: 300,
                        decoration: const BoxDecoration(
                          color: AppColors.brandPrimary50,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.location_searching,
                          size: 120,
                          color: AppColors.brandPrimary600,
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  H3Bold(
                    text: _statusText,
                    color: AppColors.brandNeutral900,
                    textAlign: TextAlign.center,
                  ),
                ] else ...[
                  FadeTransition(
                    opacity: _fadeAnimation,
                    child: Column(
                      children: [
                        Lottie.asset(
                          "assets/lottie/map_pin.json",
                          width: 100,
                          height: 100,
                          fit: BoxFit.contain,
                          repeat: true,
                          errorBuilder: (context, error, stackTrace) {
                            if (kDebugMode) {
                              print('Map pin animation error: $error');
                            }
                            return Container(
                              width: 100,
                              height: 100,
                              decoration: const BoxDecoration(
                                color: AppColors.brandPrimary50,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.location_on,
                                size: 40,
                                color: AppColors.brandPrimary600,
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: AppSpacing.md),
                        B2Medium(
                          text: _getDisplayLocation(_currentLocation!),
                          color: AppColors.brandNeutral900,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        B3Regular(
                          text: 'Location set successfully!',
                          color: AppColors.brandNeutral600,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
