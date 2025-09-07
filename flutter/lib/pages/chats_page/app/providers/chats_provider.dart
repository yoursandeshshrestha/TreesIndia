import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/pages/chats_page/app/viewmodels/chats_notifier.dart';
import 'package:trees_india/pages/chats_page/app/viewmodels/chats_state.dart';
import 'package:trees_india/pages/chats_page/app/providers/chat_usecase_providers.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';

final chatsNotifierProvider =
    StateNotifierProvider<ChatsNotifier, ChatsState>((ref) {
  final getChatRoomsUseCase = ref.read(getChatRoomsUseCaseProvider);

  return ChatsNotifier(
    getChatRoomsUseCase: getChatRoomsUseCase,
  );
})
      ..registerProvider();
