import '../entities/subscription_entity.dart';
import '../repositories/subscription_repository.dart';

class GetMySubscriptionUseCase {
  final SubscriptionRepository repository;

  GetMySubscriptionUseCase({required this.repository});

  Future<SubscriptionEntity?> execute() async {
    return await repository.getMySubscription();
  }
}