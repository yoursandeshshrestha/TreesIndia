import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:trees_india/commons/utils/services/connectivity_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/utils/services/notification_service.dart';

class ConnectivityNotifier extends StateNotifier<bool> {
  final ConnectivityService _connectivityService;
  final NotificationService _notificationService;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;
  bool _disposed = false;
  BuildContext? _context;

  ConnectivityNotifier(
    this._connectivityService,
    this._notificationService,
  ) : super(true) {
    _initializeConnectivity();
    _listenToConnectivityChanges();
  }

  void updateContext(BuildContext context) {
    _context = context;
  }

  Future<void> _initializeConnectivity() async {
    try {
      final isConnected = await _connectivityService.isConnected();
      if (!_disposed) {
        state = isConnected;
        _handleConnectivityChange(isConnected);
      }
    } catch (e) {
      debugPrint('Error initializing connectivity: $e');
    }
  }

  void _listenToConnectivityChanges() {
    _connectivitySubscription = _connectivityService
        .onConnectivityChanged()
        .listen((List<ConnectivityResult> results) {
      final isOffline = _connectivityService.isOfflineFromResults(results);
      final isConnected = !isOffline;

      if (isConnected != state && !_disposed) {
        state = isConnected;
        _handleConnectivityChange(isConnected);
      }
    }, onError: (error) {
      debugPrint('Connectivity error: $error');
    });
  }

  void _handleConnectivityChange(bool isConnected) {
    if (_context != null && _context!.mounted) {
      if (!isConnected) {
        _notificationService.showOfflineMessage(
          _context!,
          onRetry: () => debugPrint('Retry logic can be added here.'),
        );
      } else {
        _notificationService.hideOfflineMessage(_context!);
      }
    }
  }

  @override
  void dispose() {
    _disposed = true;
    _connectivitySubscription?.cancel();
    super.dispose();
  }
}
