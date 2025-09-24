import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import '../../domain/usecases/get_conversations_usecase.dart';
import '../../domain/usecases/get_conversation_usecase.dart';
import '../../domain/usecases/get_conversation_messages_usecase.dart';
import '../../domain/usecases/create_conversation_usecase.dart';
import '../../domain/usecases/send_conversation_message_usecase.dart';
import '../../domain/usecases/mark_conversation_message_read_usecase.dart';
import '../../domain/usecases/mark_conversation_as_read_usecase.dart';
import '../../domain/usecases/get_total_unread_count_usecase.dart';
import 'conversation_repository_providers.dart';

final getConversationsUseCaseProvider = Provider<GetConversationsUseCase>((ref) {
  return GetConversationsUseCase(ref.watch(conversationRepositoryProvider));
})
  ..registerProvider();

final getConversationUseCaseProvider = Provider<GetConversationUseCase>((ref) {
  return GetConversationUseCase(ref.watch(conversationRepositoryProvider));
})
  ..registerProvider();

final getConversationMessagesUseCaseProvider = Provider<GetConversationMessagesUseCase>((ref) {
  return GetConversationMessagesUseCase(ref.watch(conversationRepositoryProvider));
})
  ..registerProvider();

final createConversationUseCaseProvider = Provider<CreateConversationUseCase>((ref) {
  return CreateConversationUseCase(ref.watch(conversationRepositoryProvider));
})
  ..registerProvider();

final sendConversationMessageUseCaseProvider = Provider<SendConversationMessageUseCase>((ref) {
  return SendConversationMessageUseCase(ref.watch(conversationRepositoryProvider));
})
  ..registerProvider();

final markConversationMessageReadUseCaseProvider = Provider<MarkConversationMessageReadUseCase>((ref) {
  return MarkConversationMessageReadUseCase(ref.watch(conversationRepositoryProvider));
})
  ..registerProvider();

final markConversationAsReadUseCaseProvider = Provider<MarkConversationAsReadUseCase>((ref) {
  return MarkConversationAsReadUseCase(ref.watch(conversationRepositoryProvider));
})
  ..registerProvider();

final getTotalUnreadCountUseCaseProvider = Provider<GetTotalUnreadCountUseCase>((ref) {
  return GetTotalUnreadCountUseCase(ref.watch(conversationRepositoryProvider));
})
  ..registerProvider();