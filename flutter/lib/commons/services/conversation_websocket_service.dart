import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:trees_india/commons/environment/global_environment.dart';

class ConversationWebSocketMessage {
  final String type;
  final int? conversationId;
  final int? messageId;
  final String? message;
  final int? senderId;
  final int? unreadCount;
  final Map<String, dynamic>? data;
  final String timestamp;

  ConversationWebSocketMessage({
    required this.type,
    this.conversationId,
    this.messageId,
    this.message,
    this.senderId,
    this.unreadCount,
    this.data,
    required this.timestamp,
  });

  factory ConversationWebSocketMessage.fromJson(Map<String, dynamic> json) {
    return ConversationWebSocketMessage(
      type: json['type']?.toString() ?? '',
      conversationId: json['conversation_id'],
      messageId: json['message_id'],
      message: json['message']?.toString(),
      senderId: json['sender_id'],
      unreadCount: json['unread_count'],
      data: json['data'],
      timestamp: json['timestamp']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      if (conversationId != null) 'conversation_id': conversationId,
      if (messageId != null) 'message_id': messageId,
      if (message != null) 'message': message,
      if (senderId != null) 'sender_id': senderId,
      if (unreadCount != null) 'unread_count': unreadCount,
      if (data != null) 'data': data,
      'timestamp': timestamp,
    };
  }
}

enum ConversationWebSocketConnectionStatus {
  disconnected,
  connecting,
  connected,
  error,
}

class ConversationWebSocketService {
  WebSocket? _webSocket;
  Timer? _reconnectTimer;
  Timer? _pingTimer;

  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 10;
  static const Duration _pingInterval = Duration(seconds: 15);
  static const Duration _pongTimeout = Duration(seconds: 10);

  Timer? _pongTimeoutTimer;
  bool _waitingForPong = false;

  final StreamController<ConversationWebSocketMessage> _messageController =
      StreamController<ConversationWebSocketMessage>.broadcast();
  final StreamController<ConversationWebSocketConnectionStatus> _statusController =
      StreamController<ConversationWebSocketConnectionStatus>.broadcast();

  Stream<ConversationWebSocketMessage> get messageStream => _messageController.stream;
  Stream<ConversationWebSocketConnectionStatus> get statusStream =>
      _statusController.stream;

  ConversationWebSocketConnectionStatus _currentStatus =
      ConversationWebSocketConnectionStatus.disconnected;
  ConversationWebSocketConnectionStatus get currentStatus => _currentStatus;

  String? _currentUrl;

  Future<void> connect({
    required String token,
    String? baseUrl,
  }) async {
    final wsBaseUrl = baseUrl ?? GlobalEnvironment.wsBaseUrl;
    _currentUrl = '$wsBaseUrl/api/v1/ws/conversations/monitor?token=$token';
    await _connect();
  }

  Future<void> _connect() async {
    if (_currentUrl == null) return;

    try {
      _updateStatus(ConversationWebSocketConnectionStatus.connecting);

      _webSocket = await WebSocket.connect(_currentUrl!);
      _reconnectAttempts = 0;

      _updateStatus(ConversationWebSocketConnectionStatus.connected);

      _webSocket!.listen(
        _onMessage,
        onError: _onError,
        onDone: _onDisconnected,
      );

      _startPingTimer();
    } catch (e) {
      debugPrint('ConversationWebSocket connection failed: $e');
      _updateStatus(ConversationWebSocketConnectionStatus.error);
      _scheduleReconnect();
    }
  }

  void _onMessage(dynamic data) {
    try {
      final jsonData = json.decode(data as String);
      final message = ConversationWebSocketMessage.fromJson(jsonData);
      _messageController.add(message);

      // Handle ping/pong
      if (message.type == 'ping') {
        sendMessage(ConversationWebSocketMessage(
          type: 'pong',
          timestamp: DateTime.now().toIso8601String(),
        ));
      } else if (message.type == 'pong') {
        _waitingForPong = false;
        _pongTimeoutTimer?.cancel();
        debugPrint('ConversationWebSocket pong received');
      }
    } catch (e) {
      debugPrint('Error parsing ConversationWebSocket message: $e');
    }
  }

  void _onError(dynamic error) {
    debugPrint('ConversationWebSocket error: $error');
    _updateStatus(ConversationWebSocketConnectionStatus.error);
    _scheduleReconnect();
  }

  void _onDisconnected() {
    debugPrint('ConversationWebSocket disconnected');
    _updateStatus(ConversationWebSocketConnectionStatus.disconnected);
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
      if (_waitingForPong) {
        // Didn't receive pong from previous ping, connection might be dead
        debugPrint('ConversationWebSocket: No pong received, reconnecting...');
        _onDisconnected();
        return;
      }

      _waitingForPong = true;
      final pingSuccess = sendMessage(ConversationWebSocketMessage(
        type: 'ping',
        timestamp: DateTime.now().toIso8601String(),
      ));

      if (pingSuccess) {
        // Start timeout timer for pong response
        _pongTimeoutTimer?.cancel();
        _pongTimeoutTimer = Timer(_pongTimeout, () {
          if (_waitingForPong) {
            debugPrint('ConversationWebSocket: Pong timeout, reconnecting...');
            _onDisconnected();
          }
        });
      } else {
        debugPrint('ConversationWebSocket: Failed to send ping, reconnecting...');
        _onDisconnected();
      }
    });
  }

  void _stopPingTimer() {
    _pingTimer?.cancel();
    _pingTimer = null;
    _pongTimeoutTimer?.cancel();
    _pongTimeoutTimer = null;
    _waitingForPong = false;
  }

  void _updateStatus(ConversationWebSocketConnectionStatus status) {
    _currentStatus = status;
    _statusController.add(status);
  }

  bool sendMessage(ConversationWebSocketMessage message) {
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
    _reconnectAttempts = 0;

    _updateStatus(ConversationWebSocketConnectionStatus.disconnected);
  }

  void dispose() {
    disconnect();
    _messageController.close();
    _statusController.close();
  }
}