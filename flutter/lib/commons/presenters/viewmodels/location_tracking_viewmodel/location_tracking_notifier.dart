import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/domain/entities/worker_location_entity.dart';
import 'package:trees_india/commons/domain/usecases/get_tracking_status_usecase.dart';
import 'package:trees_india/commons/services/location_tracking_websocket_service.dart';
import 'location_tracking_state.dart';

class LocationTrackingNotifier
    extends StateNotifier<LocationTrackingStateModel> {
  final GetTrackingStatusUsecase getTrackingStatusUsecase;
  final LocationTrackingWebSocketService webSocketService;

  StreamSubscription<WorkerLocationEntity>? _locationSubscription;
  StreamSubscription<LocationTrackingConnectionStatus>? _statusSubscription;
  StreamSubscription<String>? _errorSubscription;
  StreamSubscription<void>? _trackingStoppedSubscription;

  bool _mounted = true;

  LocationTrackingNotifier({
    required this.getTrackingStatusUsecase,
    required this.webSocketService,
  }) : super(const LocationTrackingStateModel()) {
    _initializeWebSocketListeners();
  }

  @override
  void dispose() {
    _mounted = false;
    _locationSubscription?.cancel();
    _statusSubscription?.cancel();
    _errorSubscription?.cancel();
    _trackingStoppedSubscription?.cancel();
    webSocketService.dispose();
    super.dispose();
  }

  void _initializeWebSocketListeners() {
    _locationSubscription = webSocketService.workerLocationStream.listen(
      _onWorkerLocationUpdate,
      onError: _onError,
    );

    _statusSubscription = webSocketService.statusStream.listen(
      _onConnectionStatusUpdate,
      onError: _onError,
    );

    _errorSubscription = webSocketService.errorStream.listen(
      _onWebSocketError,
    );

    _trackingStoppedSubscription =
        webSocketService.trackingStoppedStream.listen(
      _onTrackingStopped,
      onError: _onError,
    );
  }

  void _onWorkerLocationUpdate(WorkerLocationEntity workerLocation) {
    if (!_mounted) return;

    state = state.copyWith(
      workerLocation: workerLocation,
      state: LocationTrackingState.tracking,
    );
  }

  void _onConnectionStatusUpdate(LocationTrackingConnectionStatus status) {
    if (!_mounted) return;

    state = state.copyWith(
      connectionStatus: status,
      state: _mapConnectionStatusToState(status),
    );
  }

  void _onWebSocketError(String error) {
    if (!_mounted) return;

    state = state.copyWith(
      state: LocationTrackingState.error,
      errorMessage: error,
    );
  }

  void _onTrackingStopped(void _) {
    if (!_mounted) return;

    debugPrint('LocationTrackingNotifier: Worker stopped sharing location');

    state = state.copyWith(
      clearWorkerLocation: true,
      state: LocationTrackingState.stopped,
    );
  }

  void _onError(dynamic error) {
    if (!_mounted) return;

    debugPrint('LocationTrackingNotifier error: $error');
    state = state.copyWith(
      state: LocationTrackingState.error,
      errorMessage: error.toString(),
    );
  }

  LocationTrackingState _mapConnectionStatusToState(
      LocationTrackingConnectionStatus status) {
    switch (status) {
      case LocationTrackingConnectionStatus.connecting:
        return LocationTrackingState.connecting;
      case LocationTrackingConnectionStatus.connected:
        return LocationTrackingState.connected;
      case LocationTrackingConnectionStatus.disconnected:
        return LocationTrackingState.stopped;
      case LocationTrackingConnectionStatus.error:
        return LocationTrackingState.error;
    }
  }

  // For customers - connect to receive worker location updates
  Future<void> connectForCustomer({
    required int userId,
    required int roomId,
  }) async {
    if (!_mounted) return;

    try {
      state = state.copyWith(state: LocationTrackingState.connecting);
      await webSocketService.connectForCustomer(userId: userId, roomId: roomId);
    } catch (e) {
      if (_mounted) {
        state = state.copyWith(
          state: LocationTrackingState.error,
          errorMessage: 'Failed to connect: ${e.toString()}',
        );
      }
    }
  }

  // For workers - connect to share location
  Future<void> connectForWorker({
    required int userId,
    required int roomId,
  }) async {
    if (!_mounted) return;

    try {
      state = state.copyWith(state: LocationTrackingState.connecting);
      await webSocketService.connectForWorker(userId: userId, roomId: roomId);
    } catch (e) {
      if (_mounted) {
        state = state.copyWith(
          state: LocationTrackingState.error,
          errorMessage: 'Failed to connect: ${e.toString()}',
        );
      }
    }
  }

  // Worker - start sharing location (WebSocket only)
  Future<void> startLocationSharing(int assignmentId) async {
    if (!_mounted) return;

    try {
      state = state.copyWith(
        state: LocationTrackingState.tracking,
        isTrackingLocation: true,
        currentAssignmentId: assignmentId,
      );

      // Start WebSocket location sharing only
      await webSocketService.startLocationSharing(assignmentId);
    } catch (e) {
      if (_mounted) {
        state = state.copyWith(
          state: LocationTrackingState.error,
          errorMessage: 'Failed to start location sharing: ${e.toString()}',
          isTrackingLocation: false,
          clearCurrentAssignmentId: true,
        );
      }
    }
  }

  // Worker - stop sharing location (WebSocket only)
  Future<void> stopLocationSharing() async {
    if (!_mounted) return;

    try {
      state = state.copyWith(
        state: LocationTrackingState.stopped,
        isTrackingLocation: false,
      );

      // Stop WebSocket location sharing only
      // webSocketService.stopLocationSharing();
      webSocketService.disconnect();

      if (_mounted) {
        state = state.copyWith(
          clearCurrentAssignmentId: true,
          clearWorkerLocation: true,
          clearTrackingStatus: true,
        );
      }
    } catch (e) {
      if (_mounted) {
        state = state.copyWith(
          state: LocationTrackingState.error,
          errorMessage: 'Failed to stop location sharing: ${e.toString()}',
        );
      }
    }
  }

  // Note: getWorkerLocation removed - location is now received via WebSocket real-time updates

  // Get tracking status
  Future<void> getTrackingStatus(int assignmentId) async {
    if (!_mounted) return;

    try {
      final trackingStatus = await getTrackingStatusUsecase.call(assignmentId);

      if (_mounted) {
        state = state.copyWith(
          trackingStatus: trackingStatus,
          state: trackingStatus.isTracking
              ? LocationTrackingState.tracking
              : LocationTrackingState.stopped,
        );
      }
    } catch (e) {
      if (_mounted) {
        state = state.copyWith(
          state: LocationTrackingState.error,
          errorMessage: 'Failed to get tracking status: ${e.toString()}',
        );
      }
    }
  }

  // Disconnect WebSocket
  void disconnect() {
    webSocketService.disconnect();

    if (_mounted) {
      // Delay state update to avoid modifying provider during widget lifecycle
      Future(() {
        if (_mounted) {
          state = state.copyWith(
            state: LocationTrackingState.initial,
            connectionStatus: LocationTrackingConnectionStatus.disconnected,
            clearWorkerLocation: true,
            clearTrackingStatus: true,
            isTrackingLocation: false,
            clearCurrentAssignmentId: true,
            clearErrorMessage: true,
          );
        }
      });
    }
  }

  // Clear error
  void clearError() {
    if (_mounted) {
      state = state.copyWith(
        clearErrorMessage: true,
        state: LocationTrackingState.initial,
      );
    }
  }
}
