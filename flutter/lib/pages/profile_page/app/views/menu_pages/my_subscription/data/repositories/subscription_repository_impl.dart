import '../../domain/entities/subscription_entity.dart';
import '../../domain/entities/payment_order_entity.dart';
import '../../domain/repositories/subscription_repository.dart';
import '../datasources/subscription_remote_datasource.dart';
import '../models/payment_order_model.dart';

class SubscriptionRepositoryImpl implements SubscriptionRepository {
  final SubscriptionRemoteDataSource remoteDataSource;

  SubscriptionRepositoryImpl({
    required this.remoteDataSource,
  });

  @override
  Future<SubscriptionEntity?> getMySubscription() async {
    final subscriptionModel = await remoteDataSource.getMySubscription();
    return subscriptionModel?.toEntity();
  }

  @override
  Future<List<SubscriptionEntity>> getSubscriptionHistory() async {
    final subscriptionModels = await remoteDataSource.getSubscriptionHistory();
    return subscriptionModels.map((model) => model.toEntity()).toList();
  }

  @override
  Future<List<SubscriptionPlanEntity>> getSubscriptionPlans() async {
    final planModels = await remoteDataSource.getSubscriptionPlans();
    return planModels.map((model) => model.toEntity()).toList();
  }

  @override
  Future<PaymentOrderEntity> createPaymentOrder(
    SubscriptionPurchaseRequestEntity request,
  ) async {
    final requestModel = SubscriptionPurchaseRequestModel.fromEntity(request);
    final paymentOrderModel = await remoteDataSource.createPaymentOrder(requestModel);
    return paymentOrderModel.toEntity();
  }

  @override
  Future<SubscriptionEntity> completePurchase(
    CompletePurchaseRequestEntity request,
  ) async {
    final requestModel = CompletePurchaseRequestModel.fromEntity(request);
    final subscriptionModel = await remoteDataSource.completePurchase(requestModel);
    return subscriptionModel.toEntity();
  }
}