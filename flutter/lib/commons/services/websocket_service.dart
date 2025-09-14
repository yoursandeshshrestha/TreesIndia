import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:trees_india/commons/environment/global_environment.dart';

class WebSocketMessage {
  final String type;
  final int? roomId;
  final int? userId;
  final String? message;
  final Map<String, dynamic>? data;
  final String timestamp;

  WebSocketMessage({
    required this.type,
    this.roomId,
    this.userId,
    this.message,
    this.data,
    required this.timestamp,
  });

  factory WebSocketMessage.fromJson(Map<String, dynamic> json) {
    return WebSocketMessage(
      type: json['type'] ?? '',
      roomId: json['room_id'],
      userId: json['user_id'],
      message: json['message'],
      data: json['data'],
      timestamp: json['timestamp'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      if (roomId != null) 'room_id': roomId,
      if (userId != null) 'user_id': userId,
      if (message != null) 'message': message,
      if (data != null) 'data': data,
      'timestamp': timestamp,
    };
  }
}

enum WebSocketConnectionStatus {
  disconnected,
  connecting,
  connected,
  error,
}

class WebSocketService {
  WebSocket? _webSocket;
  Timer? _reconnectTimer;
  Timer? _pingTimer;

  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 5;
  static const Duration _pingInterval = Duration(seconds: 30);

  final StreamController<WebSocketMessage> _messageController =
      StreamController<WebSocketMessage>.broadcast();
  final StreamController<WebSocketConnectionStatus> _statusController =
      StreamController<WebSocketConnectionStatus>.broadcast();

  Stream<WebSocketMessage> get messageStream => _messageController.stream;
  Stream<WebSocketConnectionStatus> get statusStream =>
      _statusController.stream;

  WebSocketConnectionStatus _currentStatus =
      WebSocketConnectionStatus.disconnected;
  WebSocketConnectionStatus get currentStatus => _currentStatus;

  String? _currentUrl;

  Future<void> connect({
    required int userId,
    required int roomId,
    String? baseUrl,
  }) async {
    final wsBaseUrl = baseUrl ?? GlobalEnvironment.wsBaseUrl;
    _currentUrl = '$wsBaseUrl/ws/chat?user_id=$userId&room_id=$roomId';
    await _connect();
  }

  Future<void> _connect() async {
    if (_currentUrl == null) return;

    try {
      _updateStatus(WebSocketConnectionStatus.connecting);

      _webSocket = await WebSocket.connect(_currentUrl!);
      _reconnectAttempts = 0;

      _updateStatus(WebSocketConnectionStatus.connected);

      _webSocket!.listen(
        _onMessage,
        onError: _onError,
        onDone: _onDisconnected,
      );

      _startPingTimer();
    } catch (e) {
      debugPrint('WebSocket connection failed: $e');
      _updateStatus(WebSocketConnectionStatus.error);
      _scheduleReconnect();
    }
  }

  void _onMessage(dynamic data) {
    try {
      final jsonData = json.decode(data as String);
      final message = WebSocketMessage.fromJson(jsonData);
      _messageController.add(message);

      // Handle ping/pong
      if (message.type == 'ping') {
        sendMessage(WebSocketMessage(
          type: 'pong',
          timestamp: DateTime.now().toIso8601String(),
        ));
      }
    } catch (e) {
      debugPrint('Error parsing WebSocket message: $e');
    }
  }

  void _onError(dynamic error) {
    debugPrint('WebSocket error: $error');
    _updateStatus(WebSocketConnectionStatus.error);
    _scheduleReconnect();
  }

  void _onDisconnected() {
    debugPrint('WebSocket disconnected');
    _updateStatus(WebSocketConnectionStatus.disconnected);
    _stopPingTimer();
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
    // Exponential backoff: 1, 2, 4, 8, 16 seconds (max 30)
    return (1 << (_reconnectAttempts - 1)).clamp(1, 30);
  }

  void _startPingTimer() {
    _stopPingTimer();
    _pingTimer = Timer.periodic(_pingInterval, (_) {
      sendMessage(WebSocketMessage(
        type: 'ping',
        timestamp: DateTime.now().toIso8601String(),
      ));
    });
  }

  void _stopPingTimer() {
    _pingTimer?.cancel();
    _pingTimer = null;
  }

  void _updateStatus(WebSocketConnectionStatus status) {
    _currentStatus = status;
    _statusController.add(status);
  }

  bool sendMessage(WebSocketMessage message) {
    if (_webSocket?.readyState == WebSocket.open) {
      try {
        final jsonString = json.encode(message.toJson());
        _webSocket!.add(jsonString);
        return true;
      } catch (e) {
        debugPrint('Error sending message: $e');
        return false;
      }
    }
    return false;
  }

  void disconnect() {
    _reconnectTimer?.cancel();
    _stopPingTimer();

    _webSocket?.close(1000, 'User disconnected');
    _webSocket = null;

    _updateStatus(WebSocketConnectionStatus.disconnected);
  }

  void dispose() {
    disconnect();
    _messageController.close();
    _statusController.close();
  }
}
