import '../entities/subscription_entity.dart';
import '../entities/payment_order_entity.dart';

abstract class SubscriptionRepository {
  /// Get the current active subscription for the user
  Future<SubscriptionEntity?> getMySubscription();

  /// Get subscription history for the user
  Future<List<SubscriptionEntity>> getSubscriptionHistory();

  /// Get all available subscription plans
  Future<List<SubscriptionPlanEntity>> getSubscriptionPlans();

  /// Create a payment order for subscription purchase
  Future<PaymentOrderEntity> createPaymentOrder(
    SubscriptionPurchaseRequestEntity request,
  );

  /// Complete the subscription purchase after payment
  Future<SubscriptionEntity> completePurchase(
    CompletePurchaseRequestEntity request,
  );
}