import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/services/websocket_service.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';

final websocketServiceProvider = Provider<WebSocketService>((ref) {
  return WebSocketService();
})
  ..registerProvider();
