import '../entities/broker_application_entity.dart';

abstract class BrokerApplicationRepository {
  Future<BrokerApplicationEntity> submitBrokerApplication(
      BrokerApplicationEntity application);
  Future<BrokerApplicationEntity?> getUserApplicationStatus();
}
