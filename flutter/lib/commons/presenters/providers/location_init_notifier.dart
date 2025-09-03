// import 'package:flutter/foundation.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
// import 'package:trees_india/commons/utils/services/location_service.dart';

// class LocationInitNotifier extends StateNotifier<bool>
//     with ResettableNotifier<bool> {
//   final LocationService _locationService;
//   bool _mounted = true;

//   LocationInitNotifier(this._locationService) : super(false) {
//     _initializePermission();
//   }

//   @override
//   void dispose() {
//     _mounted = false;
//     super.dispose();
//   }

//   void _checkMounted() {
//     if (!_mounted) {
//       throw StateError(
//           'Tried to use LocationInitNotifier after `dispose` was called. Consider checking `mounted`.');
//     }
//   }

//   Future<void> _initializePermission() async {
//     try {
//       final permissionStatus =
//           await _locationService.checkAndRequestPermission();
//       if (!_mounted) return;
//       state = permissionStatus;
//     } catch (e) {
//       debugPrint('Error initializing location permission: $e');
//       if (!_mounted) return;
//       state = false;
//     }
//   }

//   Future<void> requestPermission() async {
//     _checkMounted();
//     try {
//       final permissionStatus =
//           await _locationService.checkAndRequestPermission();
//       if (!_mounted) return;
//       state = permissionStatus;
//     } catch (e) {
//       debugPrint('Error requesting location permission: $e');
//       if (!_mounted) return;
//       state = false;
//     }
//   }

//   @override
//   void reset() {
//     _checkMounted();
//     state = false;
//   }
// }
