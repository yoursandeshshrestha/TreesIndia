import '../entities/broker_application_entity.dart';
import '../repositories/broker_application_repository.dart';

class GetBrokerApplicationStatusUsecase {
  final BrokerApplicationRepository repository;

  GetBrokerApplicationStatusUsecase(this.repository);

  Future<BrokerApplicationEntity?> call() async {
    return await repository.getUserApplicationStatus();
  }
}
