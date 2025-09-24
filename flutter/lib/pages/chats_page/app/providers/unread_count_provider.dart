import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import 'package:trees_india/commons/presenters/providers/conversation_websocket_service_provider.dart';
import 'package:trees_india/commons/app/auth_provider.dart';
import '../viewmodels/unread_count_notifier.dart';
import '../viewmodels/unread_count_state.dart';
import 'conversation_usecase_providers.dart';

final unreadCountProvider = StateNotifierProvider<UnreadCountNotifier, UnreadCountState>((ref) {
  return UnreadCountNotifier(
    getTotalUnreadCountUseCase: ref.watch(getTotalUnreadCountUseCaseProvider),
    conversationWebSocketService: ref.watch(conversationWebsocketServiceProvider),
    authNotifier: ref.watch(authProvider.notifier),
  );
})
  ..registerProvider();