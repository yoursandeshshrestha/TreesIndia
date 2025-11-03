import '../../domain/entities/broker_application_entity.dart';
import '../../domain/repositories/broker_application_repository.dart';
import '../datasources/broker_application_remote_datasource.dart';
import '../models/broker_application_model.dart';

class BrokerApplicationRepositoryImpl implements BrokerApplicationRepository {
  final BrokerApplicationRemoteDataSource remoteDataSource;

  BrokerApplicationRepositoryImpl({
    required this.remoteDataSource,
  });

  @override
  Future<BrokerApplicationEntity> submitBrokerApplication(
      BrokerApplicationEntity application) async {
    final applicationModel = BrokerApplicationModel.fromEntity(application);
    final response =
        await remoteDataSource.submitBrokerApplication(applicationModel);
    return response.data.toEntity(); // Model → Entity conversion
  }

  @override
  Future<BrokerApplicationEntity?> getUserApplicationStatus() async {
    final response = await remoteDataSource.getUserApplicationStatus();
    return response.data?.toEntity(); // Model → Entity conversion
  }
}
