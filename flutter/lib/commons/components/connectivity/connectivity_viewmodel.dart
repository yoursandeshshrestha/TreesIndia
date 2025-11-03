import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:trees_india/commons/utils/services/connectivity_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ConnectivityNotifier extends StateNotifier<bool> {
  final ConnectivityService _connectivityService;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;
  bool _disposed = false;

  ConnectivityNotifier(
    this._connectivityService,
  ) : super(true) {
    _initializeConnectivity();
    _listenToConnectivityChanges();
  }

  Future<void> _initializeConnectivity() async {
    try {
      final isConnected = await _connectivityService.isConnected();
      if (!_disposed) {
        state = isConnected;
        debugPrint('ConnectivityNotifier: Initial state - ${isConnected ? "Online" : "Offline"}');
      }
    } catch (e) {
      debugPrint('ConnectivityNotifier: Error initializing connectivity: $e');
    }
  }

  void _listenToConnectivityChanges() {
    _connectivitySubscription = _connectivityService
        .onConnectivityChanged()
        .listen((List<ConnectivityResult> results) {
      final isOffline = _connectivityService.isOfflineFromResults(results);
      final isConnected = !isOffline;

      if (isConnected != state && !_disposed) {
        final previousState = state;
        state = isConnected;
        debugPrint('ConnectivityNotifier: State changed from ${previousState ? "Online" : "Offline"} to ${isConnected ? "Online" : "Offline"}');
      }
    }, onError: (error) {
      debugPrint('ConnectivityNotifier: Connectivity error: $error');
    });
  }

  @override
  void dispose() {
    _disposed = true;
    _connectivitySubscription?.cancel();
    super.dispose();
  }
}
