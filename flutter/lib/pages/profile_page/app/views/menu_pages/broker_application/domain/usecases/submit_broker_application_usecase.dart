import '../entities/broker_application_entity.dart';
import '../repositories/broker_application_repository.dart';

class SubmitBrokerApplicationUsecase {
  final BrokerApplicationRepository repository;

  SubmitBrokerApplicationUsecase(this.repository);

  Future<BrokerApplicationEntity> call(BrokerApplicationEntity application) async {
    return await repository.submitBrokerApplication(application);
  }
}
