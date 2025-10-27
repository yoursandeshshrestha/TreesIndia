import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/app/auth_provider.dart';
import '../../../../commons/presenters/providers/conversation_websocket_service_provider.dart';
import '../viewmodels/conversation_notifier.dart';
import '../viewmodels/conversation_state.dart';
import 'conversation_usecase_providers.dart';

final conversationNotifierProvider = StateNotifierProvider.autoDispose.family<ConversationNotifier, ConversationState, int>((ref, conversationId) {
  return ConversationNotifier(
    conversationId: conversationId,
    getConversationMessagesUseCase: ref.read(getConversationMessagesUseCaseProvider),
    sendConversationMessageUseCase: ref.read(sendConversationMessageUseCaseProvider),
    markConversationAsReadUseCase: ref.read(markConversationAsReadUseCaseProvider),
    conversationWebSocketService: ref.read(conversationWebsocketServiceProvider),
    authNotifier: ref.read(authProvider.notifier),
  );
});