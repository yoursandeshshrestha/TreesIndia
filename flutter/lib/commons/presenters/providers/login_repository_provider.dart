import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/data/repositories/login_repository_impl.dart';
import 'package:trees_india/commons/domain/repositories/login_repository.dart';
import 'package:trees_india/commons/presenters/providers/login_datasource_provider.dart';

final loginRepositoryProvider = Provider<LoginRepository>((ref) {
  final loginDatasource = ref.read(loginDatasourceProvider);

  return LoginRepositoryImpl(loginDatasource: loginDatasource);
});
