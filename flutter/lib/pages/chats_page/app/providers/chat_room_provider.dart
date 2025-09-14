import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/pages/chats_page/app/viewmodels/chat_room_notifier.dart';
import 'package:trees_india/pages/chats_page/app/viewmodels/chat_room_state.dart';
import 'package:trees_india/pages/chats_page/app/providers/chat_usecase_providers.dart';
import 'package:trees_india/commons/presenters/providers/websocket_service_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';

final chatRoomNotifierProvider =
    StateNotifierProvider.family<ChatRoomNotifier, ChatRoomState, int>(
        (ref, roomId) {
  final getChatMessagesUseCase = ref.read(getChatMessagesUseCaseProvider);
  final sendMessageUseCase = ref.read(sendMessageUseCaseProvider);
  final markMessageReadUseCase = ref.read(markMessageReadUseCaseProvider);
  final webSocketService = ref.read(websocketServiceProvider);

  return ChatRoomNotifier(
    getChatMessagesUseCase: getChatMessagesUseCase,
    sendMessageUseCase: sendMessageUseCase,
    markMessageReadUseCase: markMessageReadUseCase,
    webSocketService: webSocketService,
  );
})
      ..registerProvider();
