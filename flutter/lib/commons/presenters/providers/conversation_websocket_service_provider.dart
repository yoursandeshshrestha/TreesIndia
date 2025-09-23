import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/services/conversation_websocket_service.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';

final conversationWebsocketServiceProvider = Provider<ConversationWebSocketService>((ref) {
  return ConversationWebSocketService();
})
  ..registerProvider();