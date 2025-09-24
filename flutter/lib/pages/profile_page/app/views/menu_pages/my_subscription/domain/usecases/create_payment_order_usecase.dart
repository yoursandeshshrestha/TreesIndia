import '../entities/payment_order_entity.dart';
import '../repositories/subscription_repository.dart';

class CreatePaymentOrderUseCase {
  final SubscriptionRepository repository;

  CreatePaymentOrderUseCase({required this.repository});

  Future<PaymentOrderEntity> execute(
    SubscriptionPurchaseRequestEntity request,
  ) async {
    return await repository.createPaymentOrder(request);
  }
}