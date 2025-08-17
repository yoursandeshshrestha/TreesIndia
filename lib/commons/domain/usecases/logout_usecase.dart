import 'package:trees_india/commons/domain/repositories/centralized_data_repository.dart';

class LogoutUsecase {
  final CentralizedDataRepository _repository;

  LogoutUsecase(this._repository);

  Future<void> call() async {
    await _repository.logout();
  }
}
