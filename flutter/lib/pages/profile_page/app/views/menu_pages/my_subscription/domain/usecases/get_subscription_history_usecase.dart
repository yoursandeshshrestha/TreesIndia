import '../entities/subscription_entity.dart';
import '../repositories/subscription_repository.dart';

class GetSubscriptionHistoryUseCase {
  final SubscriptionRepository repository;

  GetSubscriptionHistoryUseCase({required this.repository});

  Future<List<SubscriptionEntity>> execute() async {
    return await repository.getSubscriptionHistory();
  }
}