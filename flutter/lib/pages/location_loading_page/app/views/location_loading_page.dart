import 'dart:io';
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
      final locationService = ref.read(locationOnboardingServiceProvider);

      // First check if we have a saved location
      final savedLocation = await locationService.getSavedLocation();

      if (savedLocation != null) {
        if (mounted) {
          setState(() {
            _currentLocation = savedLocation;
            _statusText = 'Using saved location';
          });
        }

        // Check if location permission is already granted (without requesting)
        final hasPermission = await _checkLocationPermissionWithoutRequest();

        if (hasPermission) {
          // Try to update with current location if permission is already granted
          try {
            if (mounted) {
              setState(() {
                _statusText = 'Updating your location...';
              });
            }

            final currentLocation = await _getCurrentLocationDirectly();
            if (currentLocation != null) {
              await locationService.saveLocation(currentLocation);

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
            debugPrint('Failed to update location: $e');
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
        final hasPermission = await _checkLocationPermissionWithoutRequest();

        if (hasPermission) {
          try {
            if (mounted) {
              setState(() {
                _statusText = 'Getting your current location...';
              });
            }

            final currentLocation = await _getCurrentLocationDirectly();
            if (currentLocation != null) {
              await locationService.saveLocation(currentLocation);

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
            debugPrint('Failed to get current location: $e');
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
      }

      // Mark first login as complete
      await locationService.markFirstLoginComplete();

      // Show location found animation
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        setState(() {
          _isLocationSet = true;
        });

        _fadeController.forward();
      }

      // Navigate to home after showing the success animation
      await Future.delayed(const Duration(seconds: 3));
      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      debugPrint('Error in location initialization: $e');
      // Fallback - go to home anyway
      if (mounted) {
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
      // Get current position using proper LocationSettings
      final LocationSettings locationSettings = Platform.isAndroid
          ? AndroidSettings(
              accuracy: LocationAccuracy.medium,
              distanceFilter: 0,
              forceLocationManager: true,
              intervalDuration: const Duration(seconds: 10),
            )
          : AppleSettings(
              accuracy: LocationAccuracy.medium,
              activityType: ActivityType.fitness,
              distanceFilter: 0,
              pauseLocationUpdatesAutomatically: true,
            );

      final position = await Geolocator.getCurrentPosition(
        locationSettings: locationSettings,
      );

      // Get address from coordinates using geocoding
      final placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      if (placemarks.isEmpty) {
        return null;
      }

      final placemark = placemarks.first;
      final address = _formatDetailedAddress(placemark);

      return LocationEntity(
        address: address,
        latitude: position.latitude,
        longitude: position.longitude,
        city: placemark.locality,
        state: placemark.administrativeArea,
        country: placemark.country ?? 'Unknown',
      );
    } catch (e) {
      debugPrint('Error getting current location: $e');
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
                      print('Location fetching animation error: $error');
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
                            print('Map pin animation error: $error');
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
