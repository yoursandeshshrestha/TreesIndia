import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:trees_india/commons/app/user_profile_provider.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/presenters/providers/location_tracking_provider.dart';
import 'package:trees_india/commons/presenters/viewmodels/location_tracking_viewmodel/location_tracking_state.dart';
import 'package:trees_india/commons/presenters/viewmodels/location_tracking_viewmodel/location_tracking_notifier.dart';
import 'package:trees_india/commons/services/location_tracking_websocket_service.dart';
import 'package:trees_india/pages/bookings_page/domain/entities/booking_details_entity.dart';

class LocationTrackingModal extends ConsumerStatefulWidget {
  final BookingDetailsEntity booking;

  const LocationTrackingModal({
    super.key,
    required this.booking,
  });

  @override
  ConsumerState<LocationTrackingModal> createState() =>
      _LocationTrackingModalState();
}

class _LocationTrackingModalState extends ConsumerState<LocationTrackingModal> {
  final MapController _mapController = MapController();
  LocationTrackingNotifier? _locationNotifier;
  LatLng? _lastAnimatedLocation;
  Timer? _animationTimer;
  AnimationController? _animationController;
  int _mapKey = 0;

  @override
  void initState() {
    super.initState();
    _initializeLocationTracking();
  }

  void _initializeLocationTracking() {
    // Store the notifier reference for later use in dispose
    _locationNotifier = ref.read(locationTrackingNotifierProvider.notifier);

    // Delay the provider modification until after the widget tree is built
    Future(() {
      final profileState = ref.read(userProfileProvider);
      debugPrint('Auth state: ${profileState.toString()}');

      final userId = profileState.user?.userId;
      final roomId = widget.booking.id;

      if (userId == null) {
        debugPrint('User ID not available, skipping location tracking');
        return;
      }

      _locationNotifier!.connectForCustomer(
        userId: userId,
        roomId: roomId,
      );

      // Get initial tracking status if assignment exists
      if (widget.booking.workerAssignment != null) {
        _locationNotifier!
            .getTrackingStatus(widget.booking.workerAssignment!.id);
      }
    });
  }

  @override
  void dispose() {
    // Cancel any ongoing animation
    _animationTimer?.cancel();
    _animationController?.dispose();
    // Use the stored notifier reference to avoid using ref after dispose
    _locationNotifier?.disconnect();
    super.dispose();
  }

  void _animateToLocation(LatLng targetLocation, double zoom) {
    // Cancel any existing animation
    _animationTimer?.cancel();

    final currentCenter = _mapController.camera.center;
    final currentZoom = _mapController.camera.zoom;

    const duration = Duration(milliseconds: 1000);
    const steps = 30; // Number of animation steps
    final stepDuration =
        Duration(milliseconds: duration.inMilliseconds ~/ steps);

    int currentStep = 0;

    _animationTimer = Timer.periodic(stepDuration, (timer) {
      if (currentStep >= steps) {
        timer.cancel();
        // Ensure we end exactly at the target
        _mapController.move(targetLocation, zoom);
        _lastAnimatedLocation = targetLocation;

        // Force tile refresh to prevent grey map issue
        _refreshMapTiles();
        return;
      }

      final progress = currentStep / (steps - 1);
      final easedProgress = Curves.easeInOut.transform(progress);

      final newLat = currentCenter.latitude +
          (targetLocation.latitude - currentCenter.latitude) * easedProgress;
      final newLng = currentCenter.longitude +
          (targetLocation.longitude - currentCenter.longitude) * easedProgress;
      final newZoom = currentZoom + (zoom - currentZoom) * easedProgress;

      _mapController.move(LatLng(newLat, newLng), newZoom);
      currentStep++;
    });
  }

  void _refreshMapTiles() {
    // Force map refresh by incrementing key and rebuilding
    setState(() {
      _mapKey++;
    });

    // Also try the small movement approach as backup
    Future.delayed(const Duration(milliseconds: 100), () {
      final currentCenter = _mapController.camera.center;
      final currentZoom = _mapController.camera.zoom;

      // Move slightly and back to trigger tile loading
      _mapController.move(
          LatLng(currentCenter.latitude + 0.000001,
              currentCenter.longitude + 0.000001),
          currentZoom);

      // Move back to original position after a brief delay
      Future.delayed(const Duration(milliseconds: 50), () {
        _mapController.move(currentCenter, currentZoom);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final locationState = ref.watch(locationTrackingNotifierProvider);

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(AppSpacing.md),
      child: Container(
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: AppColors.brandNeutral200),
                ),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(12),
                  topRight: Radius.circular(12),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: H4Bold(
                      text: 'Track Worker Location',
                      color: AppColors.brandNeutral800,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
            ),

            // Status indicator
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Row(
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: _getStatusColor(locationState),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  B3Medium(
                    text: _getStatusText(locationState),
                    color: AppColors.brandNeutral600,
                  ),
                ],
              ),
            ),

            // Map
            Expanded(
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: _buildMap(locationState),
                ),
              ),
            ),

            const SizedBox(height: AppSpacing.md),

            // Worker info
            if (locationState.workerLocation != null)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.brandNeutral100,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.brandNeutral200),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.person_outline,
                      color: AppColors.brandPrimary600,
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          B3Bold(
                            text:
                                widget.booking.workerAssignment?.worker?.name ??
                                    'Worker',
                            color: AppColors.brandNeutral800,
                          ),
                          B4Regular(
                            text:
                                'Last updated: ${_formatLastUpdated(locationState.workerLocation!.lastUpdated)}',
                            color: AppColors.brandNeutral600,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: AppSpacing.md),
          ],
        ),
      ),
    );
  }

  Widget _buildMap(LocationTrackingStateModel locationState) {
    // Default center (you can get this from booking address if available)
    LatLng siliguriCenter =
        const LatLng(26.7271, 88.3953); // Default to Siliguri, India
    LatLng center = siliguriCenter;

    // If we have booking address coordinates, use those
    final bookingAddress = widget.booking.address;
    if (bookingAddress.latitude != 0 && bookingAddress.longitude != 0) {
      center = LatLng(bookingAddress.latitude, bookingAddress.longitude);
    }

    List<Marker> markers = [];

    // Add customer location marker (always visible) - Blue location pin
    markers.add(
      Marker(
        point: center,
        width: 40,
        height: 40,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.blue,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 3),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: const Icon(
            Icons.location_on,
            color: Colors.white,
            size: 24,
          ),
        ),
      ),
    );

    // Add worker location marker only if worker is sharing location
    if (locationState.workerLocation != null) {
      final workerLocation = LatLng(
        locationState.workerLocation!.latitude,
        locationState.workerLocation!.longitude,
      );

      markers.add(
        Marker(
          point: workerLocation,
          width: 20,
          height: 20,
          child: Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: Colors.red,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 4,
                  offset: const Offset(0, 1),
                ),
              ],
            ),
          ),
        ),
      );

      // Update center to focus on worker location when available
      center = workerLocation;

      // Move map to show worker location with smooth animation
      if (_lastAnimatedLocation != workerLocation) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          try {
            _animateToLocation(workerLocation, 15.0);
          } catch (e) {
            debugPrint('Error moving map to worker location: $e');
          }
        });
      }
    } else {
      // When worker stops sharing, move back to customer location with smooth animation
      LatLng targetLocation = siliguriCenter; // Default fallback

      // Use customer location if coordinates are available
      if (bookingAddress.latitude != 0 && bookingAddress.longitude != 0) {
        targetLocation =
            LatLng(bookingAddress.latitude, bookingAddress.longitude);
      }

      if (_lastAnimatedLocation != targetLocation) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          try {
            _animateToLocation(targetLocation, 15.0);
          } catch (e) {
            debugPrint('Error moving map to customer location: $e');
          }
        });
      }
    }

    return FlutterMap(
      key: ValueKey(_mapKey),
      mapController: _mapController,
      options: MapOptions(
        initialCenter: center,
        initialZoom: 15.0,
        maxZoom: 18.0,
        minZoom: 5.0,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.treesindia.app',
          maxZoom: 18,
          minZoom: 1,
          tileBuilder: (context, tileWidget, tile) {
            return tileWidget;
          },
        ),
        MarkerLayer(markers: markers),
      ],
    );
  }

  Color _getStatusColor(LocationTrackingStateModel locationState) {
    if (locationState.workerLocation != null) {
      return AppColors.stateGreen600; // Worker is sharing location
    }

    switch (locationState.connectionStatus) {
      case LocationTrackingConnectionStatus.connected:
        return AppColors.brandSecondary600; // Connected but no location
      case LocationTrackingConnectionStatus.connecting:
        return AppColors.brandSecondary600;
      case LocationTrackingConnectionStatus.disconnected:
      case LocationTrackingConnectionStatus.error:
        return AppColors.stateRed600;
    }
  }

  String _getStatusText(LocationTrackingStateModel locationState) {
    if (locationState.workerLocation != null) {
      return 'Worker is sharing their location';
    }

    switch (locationState.connectionStatus) {
      case LocationTrackingConnectionStatus.connected:
        return 'Worker is not sharing their location';
      case LocationTrackingConnectionStatus.connecting:
        return 'Connecting...';
      case LocationTrackingConnectionStatus.disconnected:
        return 'Disconnected';
      case LocationTrackingConnectionStatus.error:
        return 'Connection error';
    }
  }

  String _formatLastUpdated(DateTime lastUpdated) {
    final now = DateTime.now();
    final difference = now.difference(lastUpdated);

    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inDays}d ago';
    }
  }
}
