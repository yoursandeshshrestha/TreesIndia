import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/app/auth_provider.dart';
import '../../../../commons/presenters/providers/conversation_websocket_service_provider.dart';
import '../viewmodels/conversations_notifier.dart';
import '../viewmodels/conversations_state.dart';
import 'conversation_usecase_providers.dart';

final conversationsNotifierProvider = StateNotifierProvider.autoDispose<ConversationsNotifier, ConversationsState>((ref) {
  return ConversationsNotifier(
    getConversationsUseCase: ref.read(getConversationsUseCaseProvider),
    markConversationAsReadUseCase: ref.read(markConversationAsReadUseCaseProvider),
    conversationWebSocketService: ref.read(conversationWebsocketServiceProvider),
    authNotifier: ref.read(authProvider.notifier),
  );
});