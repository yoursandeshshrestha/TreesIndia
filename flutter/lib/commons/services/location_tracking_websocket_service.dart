import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:trees_india/commons/domain/entities/worker_location_entity.dart';
import 'package:trees_india/commons/environment/global_environment.dart';

enum LocationTrackingConnectionStatus {
  disconnected,
  connecting,
  connected,
  error,
}

class LocationTrackingWebSocketService {
  WebSocket? _webSocket;
  Timer? _reconnectTimer;
  Timer? _pingTimer;
  Timer? _locationUpdateTimer;

  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 5;
  static const Duration _pingInterval = Duration(seconds: 30);

  final StreamController<WorkerLocationEntity> _workerLocationController =
      StreamController<WorkerLocationEntity>.broadcast();
  final StreamController<LocationTrackingConnectionStatus> _statusController =
      StreamController<LocationTrackingConnectionStatus>.broadcast();
  final StreamController<String> _errorController =
      StreamController<String>.broadcast();
  final StreamController<void> _trackingStoppedController =
      StreamController<void>.broadcast();

  Stream<WorkerLocationEntity> get workerLocationStream =>
      _workerLocationController.stream;
  Stream<LocationTrackingConnectionStatus> get statusStream =>
      _statusController.stream;
  Stream<String> get errorStream => _errorController.stream;
  Stream<void> get trackingStoppedStream => _trackingStoppedController.stream;

  LocationTrackingConnectionStatus _currentStatus =
      LocationTrackingConnectionStatus.disconnected;
  LocationTrackingConnectionStatus get currentStatus => _currentStatus;

  String? _currentUrl;
  bool _isTrackingLocation = false;
  bool _isWorker = false; // Flag to identify if current user is a worker
  int? _currentAssignmentId;

  // Location tracking state (matching web-app)
  StreamSubscription<Position>? _positionStream;
  Timer? _fallbackTimer;
  Position? _lastEmittedLocation;
  static const double _minDistanceThreshold = 0.1; // Minimum distance in meters
  int? _currentUserId;
  int? _currentRoomId;

  Future<void> connectForCustomer({
    required int userId,
    required int roomId,
    String? baseUrl,
  }) async {
    _currentUserId = userId;
    _currentRoomId = roomId;
    _isWorker = false; // Customer connection
    final wsBaseUrl = baseUrl ?? GlobalEnvironment.wsBaseUrl;
    _currentUrl =
        '$wsBaseUrl/ws/location?user_id=$userId&room_id=$roomId&user_type=normal';
    await _connect();
  }

  Future<void> connectForWorker({
    required int userId,
    required int roomId,
    String? baseUrl,
  }) async {
    _currentUserId = userId;
    _currentRoomId = roomId;
    _isWorker = true; // Worker connection
    final wsBaseUrl = baseUrl ?? GlobalEnvironment.wsBaseUrl;
    _currentUrl =
        '$wsBaseUrl/ws/location?user_id=$userId&room_id=$roomId&user_type=worker';
    await _connect();
  }

  Future<void> _connect() async {
    if (_currentUrl == null) return;

    try {
      _updateStatus(LocationTrackingConnectionStatus.connecting);

      _webSocket = await WebSocket.connect(_currentUrl!);
      _reconnectAttempts = 0;

      _updateStatus(LocationTrackingConnectionStatus.connected);

      _webSocket!.listen(
        _onMessage,
        onError: _onError,
        onDone: _onDisconnected,
      );

      _startPingTimer();
    } catch (e) {
      debugPrint('Location tracking WebSocket connection failed: $e');
      _updateStatus(LocationTrackingConnectionStatus.error);
      _errorController.add('Connection failed: $e');
      _scheduleReconnect();
    }
  }

  void _onMessage(dynamic data) {
    try {
      final jsonData = json.decode(data as String);
      debugPrint('Location tracking WebSocket message received: $jsonData');

      final type = jsonData['type'] as String?;

      switch (type) {
        case 'location_update':
          _handleLocationUpdate(jsonData);
          break;
        case 'tracking_status':
          debugPrint('Received tracking status message');
          _handleTrackingStatus(jsonData);
          break;
        case 'join':
          debugPrint('User joined room: ${jsonData['user_id']}');
          break;
        case 'leave':
          final leavingUserId = jsonData['user_id'] as int?;
          debugPrint(
              'User left room: $leavingUserId (current user: $_currentUserId, isWorker: $_isWorker)');

          // Only handle leave events if we're a customer watching for worker disconnection
          if (!_isWorker && leavingUserId != null && leavingUserId != _currentUserId) {
            debugPrint('Worker $leavingUserId left room - treating as tracking stopped');
            _handleTrackingStopped(jsonData);
          } else if (_isWorker && leavingUserId == _currentUserId) {
            debugPrint('Worker (self) left room - cleaning up local state');
            // Worker leaving - just clean up local state, don't emit tracking stopped
          } else {
            debugPrint('Customer $leavingUserId left room - not affecting tracking status');
          }
          break;
        case 'worker_join':
          debugPrint('Worker joined with location');
          _handleWorkerJoin(jsonData);
          break;
        case 'stop_tracking':
          debugPrint('Location tracking stopped');
          _handleTrackingStopped(jsonData);
          break;
        case 'ping':
          _sendPong();
          break;
        case 'pong':
          debugPrint('Received pong response');
          break;
        case 'error':
          final error = jsonData['message'] as String? ?? 'Unknown error';
          debugPrint('WebSocket error message: $error');
          _errorController.add(error);
          break;
        default:
          debugPrint('Unknown message type: $type, full message: $jsonData');
      }
    } catch (e) {
      debugPrint('Error parsing location tracking WebSocket message: $e');
      debugPrint('Raw message data: $data');
      _errorController.add('Error parsing message: $e');
    }
  }

  void _handleLocationUpdate(Map<String, dynamic> jsonData) {
    try {
      final messageData = jsonData['data'] as Map<String, dynamic>?;
      debugPrint('Location update data: $messageData');

      // Handle flat format location updates (sent from Flutter worker)
      if (messageData == null) {
        debugPrint('Handling flat location_update message');
        // This is a flat location update from a worker - just acknowledge it
        // The actual location is already being processed by the backend
        return;
      }

      final messageType = messageData['type'] as String?;
      debugPrint('Message type: $messageType');

      if (messageType == 'worker_location') {
        // Handle worker location update
        final workerLocationData = messageData['data'] as Map<String, dynamic>?;
        debugPrint('Worker location data: $workerLocationData');

        if (workerLocationData != null) {
          // Try different possible field names based on backend response format
          final workerLocation = WorkerLocationEntity(
            workerId:
                _getIntValue(workerLocationData, ['worker_id', 'WorkerID']) ??
                    0,
            assignmentId: _getIntValue(
                    workerLocationData, ['assignment_id', 'AssignmentID']) ??
                0,
            bookingId:
                _getIntValue(workerLocationData, ['booking_id', 'BookingID']) ??
                    0,
            latitude: _getDoubleValue(workerLocationData,
                    ['latitude', 'worker_location.latitude']) ??
                0.0,
            longitude: _getDoubleValue(workerLocationData,
                    ['longitude', 'worker_location.longitude']) ??
                0.0,
            accuracy: _getDoubleValue(workerLocationData,
                    ['accuracy', 'worker_location.accuracy']) ??
                0.0,
            status: workerLocationData['status'] ??
                workerLocationData['Status'] ??
                'tracking',
            lastUpdated: _getDateTimeValue(workerLocationData, [
                  'last_updated',
                  'last_location_update',
                  'LastLocationUpdate'
                ]) ??
                DateTime.now(),
            workerName: workerLocationData['worker_name'] ??
                workerLocationData['WorkerName'],
            customerName: workerLocationData['customer_name'] ??
                workerLocationData['CustomerName'],
            hasArrived: workerLocationData['has_arrived'] ?? false,
          );

          debugPrint(
              'Created WorkerLocationEntity: ${workerLocation.latitude}, ${workerLocation.longitude}');
          _workerLocationController.add(workerLocation);
        }
      } else if (messageType == 'stop_tracking') {
        _handleTrackingStopped(jsonData);
      }
    } catch (e) {
      debugPrint('Error handling location update: $e');
      _errorController.add('Error handling location update: $e');
    }
  }

  void _handleTrackingStatus(Map<String, dynamic> jsonData) {
    try {
      debugPrint('Handling tracking status message: $jsonData');

      final data = jsonData['data'] as Map<String, dynamic>?;
      if (data == null) {
        debugPrint('No data in tracking_status message');
        return;
      }

      final trackingStatus = data['tracking_status'] as Map<String, dynamic>?;
      final messageType = data['type'] as String?;
      final error = data['error'] as String?;

      debugPrint(
          'Tracking status data - type: $messageType, error: $error, tracking_status: $trackingStatus');

      // Handle tracking errors
      if (messageType == 'tracking_error') {
        debugPrint('Received tracking error: $error');
        _errorController.add('Tracking error: $error');
        return;
      }

      if (trackingStatus == null) {
        debugPrint('No tracking_status in message data');
        return;
      }

      final isTracking = trackingStatus['is_tracking'] as bool?;

      debugPrint(
          'Tracking status - isTracking: $isTracking, type: $messageType');

      // Handle tracking stopped
      if (isTracking == false || messageType == 'tracking_stopped') {
        debugPrint('Worker stopped tracking - emitting tracking stopped event');
        _trackingStoppedController.add(null);
        return; // Return early for stopped tracking
      }

      // Handle tracking started (optional, for completeness)
      if (isTracking == true || messageType == 'tracking_started') {
        debugPrint('Worker started tracking');
        // Could emit a tracking started event if needed
      }
    } catch (e) {
      debugPrint('Error handling tracking status: $e');
      _errorController.add('Error handling tracking status: $e');
    }
  }

  void _handleWorkerJoin(Map<String, dynamic> jsonData) {
    try {
      debugPrint('Handling worker join with location: $jsonData');

      // Extract location data from worker_join message
      final latitude = _getDoubleValue(jsonData, ['latitude']) ?? 0.0;
      final longitude = _getDoubleValue(jsonData, ['longitude']) ?? 0.0;
      final accuracy = _getDoubleValue(jsonData, ['accuracy']) ?? 0.0;
      final userId = _getIntValue(jsonData, ['user_id']) ?? 0;
      final roomId = _getIntValue(jsonData, ['room_id']) ?? 0;

      if (latitude != 0.0 && longitude != 0.0) {
        // Create WorkerLocationEntity from worker_join data
        final workerLocation = WorkerLocationEntity(
          workerId: userId,
          assignmentId: roomId, // Using roomId as assignmentId
          bookingId: roomId,
          latitude: latitude,
          longitude: longitude,
          accuracy: accuracy,
          status: 'tracking',
          lastUpdated: DateTime.now(),
          workerName: null, // Not available in worker_join message
          customerName: null,
          hasArrived: false,
        );

        debugPrint(
            'Created WorkerLocationEntity from worker_join: ${workerLocation.latitude}, ${workerLocation.longitude}');
        _workerLocationController.add(workerLocation);
      }
    } catch (e) {
      debugPrint('Error handling worker join: $e');
    }
  }

  void _handleTrackingStopped(Map<String, dynamic> jsonData) {
    try {
      debugPrint('Handling tracking stopped');

      // Emit tracking stopped event
      _trackingStoppedController.add(null);

      // Also send error message for UI feedback
      _errorController.add('Worker stopped sharing location');

      debugPrint('Tracking stopped event emitted');
    } catch (e) {
      debugPrint('Error handling tracking stopped: $e');
    }
  }

  // Helper methods to handle different field name formats from backend
  int? _getIntValue(Map<String, dynamic> data, List<String> possibleKeys) {
    for (final key in possibleKeys) {
      if (key.contains('.')) {
        // Handle nested keys like 'worker_location.latitude'
        final parts = key.split('.');
        dynamic value = data;
        for (final part in parts) {
          if (value is Map<String, dynamic> && value.containsKey(part)) {
            value = value[part];
          } else {
            value = null;
            break;
          }
        }
        if (value != null) {
          return (value is int) ? value : int.tryParse(value.toString());
        }
      } else {
        final value = data[key];
        if (value != null) {
          return (value is int) ? value : int.tryParse(value.toString());
        }
      }
    }
    return null;
  }

  double? _getDoubleValue(
      Map<String, dynamic> data, List<String> possibleKeys) {
    for (final key in possibleKeys) {
      if (key.contains('.')) {
        // Handle nested keys like 'worker_location.latitude'
        final parts = key.split('.');
        dynamic value = data;
        for (final part in parts) {
          if (value is Map<String, dynamic> && value.containsKey(part)) {
            value = value[part];
          } else {
            value = null;
            break;
          }
        }
        if (value != null) {
          return (value is double) ? value : double.tryParse(value.toString());
        }
      } else {
        final value = data[key];
        if (value != null) {
          return (value is double) ? value : double.tryParse(value.toString());
        }
      }
    }
    return null;
  }

  DateTime? _getDateTimeValue(
      Map<String, dynamic> data, List<String> possibleKeys) {
    for (final key in possibleKeys) {
      final value = data[key];
      if (value != null) {
        try {
          return DateTime.parse(value.toString());
        } catch (e) {
          debugPrint('Error parsing datetime for key $key: $e');
        }
      }
    }
    return null;
  }

  void _onError(dynamic error) {
    debugPrint('Location tracking WebSocket error: $error');
    _updateStatus(LocationTrackingConnectionStatus.error);
    _errorController.add('WebSocket error: $error');
    _scheduleReconnect();
  }

  void _onDisconnected() {
    debugPrint('Location tracking WebSocket disconnected');
    _updateStatus(LocationTrackingConnectionStatus.disconnected);
    _stopPingTimer();
    stopLocationSharing();
    _scheduleReconnect();
  }

  void _scheduleReconnect() {
    if (_reconnectAttempts >= _maxReconnectAttempts) {
      debugPrint('Max reconnection attempts reached');
      return;
    }

    _reconnectAttempts++;
    final delay = Duration(seconds: _calculateReconnectDelay());

    debugPrint(
        'Reconnecting in ${delay.inSeconds} seconds (attempt $_reconnectAttempts)');

    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(delay, () {
      _connect();
    });
  }

  int _calculateReconnectDelay() {
    return (1 << (_reconnectAttempts - 1)).clamp(1, 30);
  }

  void _startPingTimer() {
    _stopPingTimer();
    _pingTimer = Timer.periodic(_pingInterval, (_) {
      _sendMessage({
        'type': 'ping',
        'timestamp': DateTime.now().toIso8601String(),
      });
    });
  }

  void _stopPingTimer() {
    _pingTimer?.cancel();
    _pingTimer = null;
  }

  void _sendPong() {
    _sendMessage({
      'type': 'pong',
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  void _updateStatus(LocationTrackingConnectionStatus status) {
    _currentStatus = status;
    _statusController.add(status);
  }

  bool _sendMessage(Map<String, dynamic> message) {
    if (_webSocket?.readyState == WebSocket.open) {
      try {
        final jsonString = json.encode(message);
        _webSocket!.add(jsonString);
        return true;
      } catch (e) {
        debugPrint('Error sending location tracking message: $e');
        return false;
      }
    }
    return false;
  }

  Future<void> startLocationSharing(int assignmentId) async {
    if (!await _checkLocationPermission()) {
      _errorController.add('Location permission denied');
      return;
    }

    _currentAssignmentId = assignmentId;
    _isTrackingLocation = true;

    // Send worker_join message (matching web-app pattern)
    _sendMessage({
      'type': 'worker_join',
      'room_id': _currentRoomId,
      'user_id': _currentUserId,
      'assignment_id': assignmentId,
      'latitude': 0.0,
      'longitude': 0.0,
      'accuracy': 0.0,
      'timestamp': DateTime.now().toIso8601String(),
    });

    // Send initial start_tracking message with 0,0 coordinates (matching web-app)
    _sendMessage({
      'type': 'start_tracking',
      'room_id': _currentRoomId,
      'user_id': _currentUserId,
      'assignment_id': assignmentId,
      'latitude': 0.0,
      'longitude': 0.0,
      'accuracy': 0.0,
      'timestamp': DateTime.now().toIso8601String(),
    });

    // Start continuous location updates
    _startLocationUpdates(assignmentId);

    debugPrint('Started location sharing for assignment $assignmentId');
  }

  void stopLocationSharing() {
    _stopLocationUpdates();
    _isTrackingLocation = false;

    final assignmentId = _currentAssignmentId; // Store before nulling

    debugPrint(
        'Stopping location sharing for assignment $assignmentId - Room ID: $_currentRoomId, User ID: $_currentUserId');

    // Send stop_tracking message (matching web-app format)
    final stopTrackingMessage = {
      'type': 'stop_tracking',
      'room_id': _currentRoomId,
      'user_id': _currentUserId,
      'assignment_id': assignmentId,
      'timestamp': DateTime.now().toIso8601String(),
    };

    debugPrint('Sending stop_tracking message: $stopTrackingMessage');
    _sendMessage(stopTrackingMessage);

    debugPrint(
        'Stopped location sharing for assignment $assignmentId (staying connected to room)');

    // Clear assignment ID after a short delay to ensure message is processed
    Future.delayed(const Duration(milliseconds: 100), () {
      _currentAssignmentId = null;
    });
  }

  Future<bool> _checkLocationPermission() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return false;
    }

    return true;
  }

  void _startLocationUpdates(int assignmentId) {
    _stopLocationUpdates();

    // Send initial location update immediately
    _sendInitialLocationUpdate(assignmentId);

    // Start continuous position monitoring (matching web-app watchPosition)
    _positionStream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 0, // Get all position updates
        timeLimit: Duration(seconds: 30),
      ),
    ).listen(
      (Position position) {
        if (_isTrackingLocation && _currentAssignmentId == assignmentId) {
          _updateLocationFromPosition(assignmentId, position);
        }
      },
      onError: (error) {
        debugPrint('Position stream error: $error');
        // Fallback to periodic updates if stream fails
        _startPeriodicFallbackUpdates(assignmentId);
      },
    );

    // Start periodic fallback updates (every 30 seconds) to ensure updates
    _startPeriodicFallbackUpdates(assignmentId);
  }

  void _stopLocationUpdates() {
    _positionStream?.cancel();
    _positionStream = null;
    _fallbackTimer?.cancel();
    _fallbackTimer = null;
    _locationUpdateTimer?.cancel();
    _locationUpdateTimer = null;
  }

  // Send initial location update immediately (matching web-app)
  Future<void> _sendInitialLocationUpdate(int assignmentId) async {
    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );

      _updateLocationFromPosition(assignmentId, position);
    } catch (e) {
      debugPrint('Failed to get initial position: $e');
      // Send location update with default coordinates
      _sendLocationUpdateMessage(0.0, 0.0, 0.0);
    }
  }

  // Update location from position (matching web-app updateLocation)
  void _updateLocationFromPosition(int assignmentId, Position position) {
    if (!_isTrackingLocation || _currentAssignmentId != assignmentId) return;

    final shouldEmit = _shouldEmitLocationUpdate(position);
    if (shouldEmit) {
      _sendLocationUpdateMessage(
          position.latitude, position.longitude, position.accuracy);
      _lastEmittedLocation = position;
    }
  }

  // Check if location update should be emitted (matching web-app logic)
  bool _shouldEmitLocationUpdate(Position position) {
    if (_lastEmittedLocation == null) return true;

    final distance = _calculateDistance(
      _lastEmittedLocation!.latitude,
      _lastEmittedLocation!.longitude,
      position.latitude,
      position.longitude,
    );

    return distance >= _minDistanceThreshold;
  }

  // Calculate distance between two points (matching web-app)
  double _calculateDistance(
      double lat1, double lon1, double lat2, double lon2) {
    const double earthRadius = 6371000; // Earth's radius in meters

    final dLat = (lat2 - lat1) * (pi / 180);
    final dLon = (lon2 - lon1) * (pi / 180);

    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1 * (pi / 180)) *
            cos(lat2 * (pi / 180)) *
            sin(dLon / 2) *
            sin(dLon / 2);

    final c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return earthRadius * c; // Distance in meters
  }

  // Start periodic fallback updates (matching web-app 30-second intervals)
  void _startPeriodicFallbackUpdates(int assignmentId) {
    _fallbackTimer?.cancel();
    _fallbackTimer = Timer.periodic(const Duration(seconds: 30), (_) async {
      if (!_isTrackingLocation || _currentAssignmentId != assignmentId) return;

      try {
        final position = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
            timeLimit: Duration(seconds: 10),
          ),
        );

        // Always send fallback update regardless of distance threshold
        _sendLocationUpdateMessage(
            position.latitude, position.longitude, position.accuracy);
        _lastEmittedLocation = position;

        debugPrint('Fallback location update sent');
      } catch (e) {
        debugPrint('Fallback location update failed: $e');
      }
    });
  }

  // Send location update message (matching web-app message format)
  void _sendLocationUpdateMessage(
      double latitude, double longitude, double accuracy) {
    _sendMessage({
      'type': 'location_update',
      'room_id': _currentRoomId,
      'user_id': _currentUserId,
      'assignment_id': _currentAssignmentId,
      'latitude': latitude,
      'longitude': longitude,
      'accuracy': accuracy,
      'status': 'active',
      'timestamp': DateTime.now().toIso8601String(),
    });

    debugPrint('Location update sent: lat=$latitude, lng=$longitude');
  }

  void disconnect() {
    _reconnectTimer?.cancel();
    _stopPingTimer();

    // Stop location sharing if active
    if (_isTrackingLocation) {
      stopLocationSharing();
    }

    // Send leave message before disconnecting (if connected)
    if (_webSocket?.readyState == WebSocket.open &&
        _currentRoomId != null &&
        _currentUserId != null) {
      _sendMessage({
        'type': 'leave',
        'room_id': _currentRoomId,
        'user_id': _currentUserId,
        'timestamp': DateTime.now().toIso8601String(),
      });
      debugPrint('Sent leave message before disconnecting');
    }

    _webSocket?.close(1000, 'User disconnected');
    _webSocket = null;

    // Clear all session data
    _currentUserId = null;
    _currentRoomId = null;
    _currentUrl = null;
    _isWorker = false;
    _currentAssignmentId = null;
    _isTrackingLocation = false;

    _updateStatus(LocationTrackingConnectionStatus.disconnected);
  }

  void dispose() {
    disconnect();
    _workerLocationController.close();
    _statusController.close();
    _errorController.close();
    _trackingStoppedController.close();
  }
}
