import 'dart:async';
import 'dart:convert';
import 'dart:developer';
import 'package:trees_india/commons/environment/global_environment.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

enum WebSocketConnectionState {
  disconnected,
  connecting,
  connected,
  error,
}

class NotificationWebSocketMessage {
  final String event;
  final Map<String, dynamic> data;

  NotificationWebSocketMessage({
    required this.event,
    required this.data,
  });

  factory NotificationWebSocketMessage.fromJson(Map<String, dynamic> json) {
    return NotificationWebSocketMessage(
      event: json['event'] as String,
      data: json['data'] as Map<String, dynamic>,
    );
  }
}

class NotificationWebSocketService {
  WebSocketChannel? _channel;
  final StreamController<NotificationWebSocketMessage> _messageController =
      StreamController<NotificationWebSocketMessage>.broadcast();
  final StreamController<WebSocketConnectionState> _connectionStateController =
      StreamController<WebSocketConnectionState>.broadcast();
  final StreamController<String?> _errorController =
      StreamController<String?>.broadcast();

  Timer? _reconnectTimer;
  Timer? _pingTimer;
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 5;
  String? _token;
  bool _isConnecting = false;

  // Streams
  Stream<NotificationWebSocketMessage> get messageStream =>
      _messageController.stream;
  Stream<WebSocketConnectionState> get connectionStateStream =>
      _connectionStateController.stream;
  Stream<String?> get errorStream => _errorController.stream;

  // Current state
  WebSocketConnectionState get connectionState =>
      _connectionStateController.hasListener
          ? WebSocketConnectionState.disconnected
          : WebSocketConnectionState.disconnected;

  bool get isConnected => _channel != null;

  void connect(String token) {
    if (_isConnecting || (_channel != null && isConnected)) {
      return;
    }

    _token = token;
    _isConnecting = true;
    _connectionStateController.add(WebSocketConnectionState.connecting);
    _errorController.add(null);

    try {
      final wsBaseUrl = GlobalEnvironment.wsBaseUrl;
      final wsUrl = '$wsBaseUrl/api/v1/in-app-notifications/ws';
      final uri = Uri.parse('$wsUrl?token=$token');

      _channel = WebSocketChannel.connect(uri);

      _channel!.ready.then((_) {
        _isConnecting = false;
        _reconnectAttempts = 0;
        _startPing();
        _connectionStateController.add(WebSocketConnectionState.connected);
        log('🔌 WebSocket connected successfully');
      }).catchError((error) {
        _isConnecting = false;
        _handleConnectionError(error);
      });

      _channel!.stream.listen(
        (message) {
          try {
            final Map<String, dynamic> data = json.decode(message);
            final wsMessage = NotificationWebSocketMessage.fromJson(data);
            _messageController.add(wsMessage);
            log('📩 Received WebSocket message: ${wsMessage.event}');
          } catch (e) {
            log('❌ Error parsing WebSocket message: $e');
          }
        },
        onError: (error) {
          log('❌ WebSocket stream error: $error');
          _handleConnectionError(error);
        },
        onDone: () {
          log('🔌 WebSocket connection closed');
          _handleConnectionClosed();
        },
      );
    } catch (e) {
      _isConnecting = false;
      _handleConnectionError(e);
    }
  }

  void disconnect() {
    log('🔌 Disconnecting WebSocket');
    _stopReconnectTimer();
    _stopPing();

    _channel?.sink.close(1000, 'Client disconnecting');
    _channel = null;
    _token = null;
    _reconnectAttempts = 0;
    _connectionStateController.add(WebSocketConnectionState.disconnected);
  }

  void send(Map<String, dynamic> message) {
    if (_channel != null && isConnected) {
      _channel!.sink.add(json.encode(message));
      log('📤 Sent WebSocket message: ${message['type'] ?? 'unknown'}');
    } else {
      log('❌ Cannot send message: WebSocket not connected');
    }
  }

  void markAsRead(int notificationId) {
    send({
      'type': 'mark_read',
      'notification_id': notificationId,
    });
  }

  void markAllAsRead() {
    send({
      'type': 'mark_all_read',
    });
  }

  void _handleConnectionError(dynamic error) {
    log('❌ WebSocket connection error: $error');
    _isConnecting = false;
    _channel = null;
    _stopPing();
    _connectionStateController.add(WebSocketConnectionState.error);
    _errorController.add(error.toString());
    _scheduleReconnect();
  }

  void _handleConnectionClosed() {
    _isConnecting = false;
    _channel = null;
    _stopPing();
    _connectionStateController.add(WebSocketConnectionState.disconnected);

    if (_token != null) {
      _scheduleReconnect();
    }
  }

  void _scheduleReconnect() {
    if (_reconnectAttempts >= _maxReconnectAttempts) {
      _errorController.add('Connection lost. Please refresh the page.');
      return;
    }

    final delay = Duration(
      milliseconds: (1000 * (1 << _reconnectAttempts)).clamp(1000, 30000),
    );
    _reconnectAttempts++;

    _reconnectTimer = Timer(delay, () {
      if (_token != null) {
        log('🔄 Attempting WebSocket reconnect (attempt $_reconnectAttempts)');
        connect(_token!);
      }
    });
  }

  void _startPing() {
    _pingTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      if (_channel != null && isConnected) {
        send({'type': 'ping'});
      }
    });
  }

  void _stopPing() {
    _pingTimer?.cancel();
    _pingTimer = null;
  }

  void _stopReconnectTimer() {
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
  }

  void dispose() {
    disconnect();
    _messageController.close();
    _connectionStateController.close();
    _errorController.close();
  }
}
