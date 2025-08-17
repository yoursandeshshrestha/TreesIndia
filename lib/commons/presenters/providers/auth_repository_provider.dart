import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/data/repositories/auth_repository_impl.dart';
import 'package:trees_india/commons/domain/repositories/auth_repository.dart';
import 'package:trees_india/commons/presenters/providers/auth_datasource_provider.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final authDatasource = ref.read(authDatasourceProvider);

  return AuthRepositoryImpl(authDatasource: authDatasource);
});
