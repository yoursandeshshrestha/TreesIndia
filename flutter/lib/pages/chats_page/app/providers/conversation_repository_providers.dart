import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/presenters/providers/provider_registry.dart';
import '../../data/repositories/conversation_repository_impl.dart';
import '../../domain/repositories/conversation_repository.dart';
import 'conversation_datasource_providers.dart';

final conversationRepositoryProvider = Provider<ConversationRepository>((ref) {
  return ConversationRepositoryImpl(
    remoteDatasource: ref.watch(conversationRemoteDatasourceProvider),
  );
})
  ..registerProvider();