import 'package:trees_india/pages/register_page/domain/entities/register_response.dart';

abstract class RegisterRepository {
  Future<RegisterResponse> createAccountWithEmailAndPassword(
    String name,
    String email,
    String password,
    String dataRegion,
  );
}
