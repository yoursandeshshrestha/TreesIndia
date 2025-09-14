import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import '../../data/datasources/chat_remote_datasource.dart';
import '../../data/repositories/chat_repository_impl.dart';
import '../../domain/repositories/chat_repository.dart';
import '../../domain/usecases/get_chat_messages_usecase.dart';
import '../../domain/usecases/send_message_usecase.dart';
import '../../domain/usecases/mark_message_read_usecase.dart';
import '../../domain/usecases/get_chat_rooms_usecase.dart';

// Data Source Provider
final chatRemoteDataSourceProvider = Provider<ChatRemoteDatasource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);
  return ChatRemoteDatasourceImpl(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
})
  ..registerProvider();

// Repository Provider
final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  final remoteDataSource = ref.read(chatRemoteDataSourceProvider);
  return ChatRepositoryImpl(remoteDataSource);
})
  ..registerProvider();

// Use Case Providers
final getChatMessagesUseCaseProvider = Provider<GetChatMessagesUseCase>((ref) {
  final repository = ref.read(chatRepositoryProvider);
  return GetChatMessagesUseCase(repository);
})
  ..registerProvider();

final sendMessageUseCaseProvider = Provider<SendMessageUseCase>((ref) {
  final repository = ref.read(chatRepositoryProvider);
  return SendMessageUseCase(repository);
})
  ..registerProvider();

final markMessageReadUseCaseProvider = Provider<MarkMessageReadUseCase>((ref) {
  final repository = ref.read(chatRepositoryProvider);
  return MarkMessageReadUseCase(repository);
})
  ..registerProvider();

final getChatRoomsUseCaseProvider = Provider<GetChatRoomsUseCase>((ref) {
  final repository = ref.read(chatRepositoryProvider);
  return GetChatRoomsUseCase(repository);
})
  ..registerProvider();
