import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import 'package:trees_india/commons/presenters/providers/dio_provider.dart';
import 'package:trees_india/commons/presenters/providers/error_handler_provider.dart';
import '../../data/datasources/conversation_remote_datasource.dart';

final conversationRemoteDatasourceProvider = Provider<ConversationRemoteDatasource>((ref) {
  return ConversationRemoteDatasourceImpl(
    dioClient: ref.watch(dioClientProvider),
    errorHandler: ref.watch(errorHandlerProvider),
  );
})
  ..registerProvider();