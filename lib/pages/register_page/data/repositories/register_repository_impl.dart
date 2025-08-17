import 'package:trees_india/pages/register_page/data/datasources/register_datasource.dart';
import 'package:trees_india/pages/register_page/domain/entities/register_response.dart';
import 'package:trees_india/pages/register_page/domain/repositories/register_repository.dart';

class RegisterRepositoryImpl extends RegisterRepository {
  final RegisterDatasource _datasource;

  RegisterRepositoryImpl(
    this._datasource,
  );

  @override
  Future<RegisterResponse> createAccountWithEmailAndPassword(
      String name, String email, String password, String dataRegion) async {
    return await _datasource.createAccountWithEmailAndPassword(
      name,
      email,
      password,
      dataRegion,
    );
  }
}
