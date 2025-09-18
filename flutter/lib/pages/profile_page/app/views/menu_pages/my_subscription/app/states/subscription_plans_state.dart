import 'package:equatable/equatable.dart';
import '../../domain/entities/subscription_entity.dart';
import '../../domain/entities/payment_order_entity.dart';

enum SubscriptionPlansStatus { initial, loading, success, failure, purchasing, purchaseSuccess, purchaseFailure }

class SubscriptionPlansState extends Equatable {
  final SubscriptionPlansStatus status;
  final List<SubscriptionPlanEntity> plans;
  final PaymentOrderEntity? paymentOrder;
  final SubscriptionEntity? purchasedSubscription;
  final String? errorMessage;
  final int? selectedPlanId;
  final String? selectedDurationType;

  const SubscriptionPlansState({
    this.status = SubscriptionPlansStatus.initial,
    this.plans = const [],
    this.paymentOrder,
    this.purchasedSubscription,
    this.errorMessage,
    this.selectedPlanId,
    this.selectedDurationType,
  });

  SubscriptionPlansState copyWith({
    SubscriptionPlansStatus? status,
    List<SubscriptionPlanEntity>? plans,
    PaymentOrderEntity? paymentOrder,
    SubscriptionEntity? purchasedSubscription,
    String? errorMessage,
    int? selectedPlanId,
    String? selectedDurationType,
  }) {
    return SubscriptionPlansState(
      status: status ?? this.status,
      plans: plans ?? this.plans,
      paymentOrder: paymentOrder ?? this.paymentOrder,
      purchasedSubscription: purchasedSubscription ?? this.purchasedSubscription,
      errorMessage: errorMessage,
      selectedPlanId: selectedPlanId ?? this.selectedPlanId,
      selectedDurationType: selectedDurationType ?? this.selectedDurationType,
    );
  }

  SubscriptionPlansState clearError() {
    return copyWith(errorMessage: null);
  }

  SubscriptionPlansState clearPaymentOrder() {
    return SubscriptionPlansState(
      status: status,
      plans: plans,
      paymentOrder: null,
      purchasedSubscription: purchasedSubscription,
      errorMessage: errorMessage,
      selectedPlanId: selectedPlanId,
      selectedDurationType: selectedDurationType,
    );
  }

  bool get isLoading => status == SubscriptionPlansStatus.loading;
  bool get isPurchasing => status == SubscriptionPlansStatus.purchasing;
  bool get hasPurchased => status == SubscriptionPlansStatus.purchaseSuccess;
  bool get hasError => status == SubscriptionPlansStatus.failure ||
                       status == SubscriptionPlansStatus.purchaseFailure;

  SubscriptionPlanEntity? get selectedPlan {
    if (selectedPlanId == null) return null;
    try {
      return plans.firstWhere((plan) => plan.id == selectedPlanId);
    } catch (e) {
      return null;
    }
  }

  double? get selectedPlanPrice {
    final plan = selectedPlan;
    if (plan == null || selectedDurationType == null) return null;

    final pricing = plan.getPricingByDuration(selectedDurationType!);
    return pricing?.price;
  }

  @override
  List<Object?> get props => [
        status,
        plans,
        paymentOrder,
        purchasedSubscription,
        errorMessage,
        selectedPlanId,
        selectedDurationType,
      ];
}