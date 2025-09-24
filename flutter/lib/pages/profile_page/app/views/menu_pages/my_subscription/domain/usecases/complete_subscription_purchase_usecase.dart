import '../entities/subscription_entity.dart';
import '../entities/payment_order_entity.dart';
import '../repositories/subscription_repository.dart';

class CompleteSubscriptionPurchaseUseCase {
  final SubscriptionRepository repository;

  CompleteSubscriptionPurchaseUseCase({required this.repository});

  Future<SubscriptionEntity> execute(
    CompletePurchaseRequestEntity request,
  ) async {
    return await repository.completePurchase(request);
  }
}