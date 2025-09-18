import '../entities/subscription_entity.dart';
import '../repositories/subscription_repository.dart';

class GetSubscriptionPlansUseCase {
  final SubscriptionRepository repository;

  GetSubscriptionPlansUseCase({required this.repository});

  Future<List<SubscriptionPlanEntity>> execute() async {
    return await repository.getSubscriptionPlans();
  }
}