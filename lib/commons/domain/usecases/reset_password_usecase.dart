import 'package:trees_india/commons/domain/repositories/centralized_data_repository.dart';

class ResetPasswordUsecase {
  final CentralizedDataRepository _repository;

  ResetPasswordUsecase(this._repository);

  Future<bool> call(String email) async {
    return await _repository.resetPassword(email);
  }
}
