import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:trees_india/commons/app/user_profile_provider.dart';
import '../states/subscription_plans_state.dart';
import '../../domain/entities/payment_order_entity.dart';
import '../../domain/usecases/get_subscription_plans_usecase.dart';
import '../../domain/usecases/create_payment_order_usecase.dart';
import '../../domain/usecases/complete_subscription_purchase_usecase.dart';

class SubscriptionPlansNotifier extends StateNotifier<SubscriptionPlansState> {
  final GetSubscriptionPlansUseCase getSubscriptionPlansUseCase;
  final CreatePaymentOrderUseCase createPaymentOrderUseCase;
  final CompleteSubscriptionPurchaseUseCase completeSubscriptionPurchaseUseCase;
  final Razorpay razorpay;
  final Ref ref;

  SubscriptionPlansNotifier({
    required this.getSubscriptionPlansUseCase,
    required this.createPaymentOrderUseCase,
    required this.completeSubscriptionPurchaseUseCase,
    required this.razorpay,
    required this.ref,
  }) : super(const SubscriptionPlansState()) {
    razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  @override
  void dispose() {
    razorpay.clear();
    super.dispose();
  }

  Future<void> loadSubscriptionPlans() async {
    state = state.copyWith(status: SubscriptionPlansStatus.loading);

    try {
      final plans = await getSubscriptionPlansUseCase.execute();
      state = state.copyWith(
        status: SubscriptionPlansStatus.success,
        plans: plans,
        errorMessage: null,
      );
    } catch (error) {
      state = state.copyWith(
        status: SubscriptionPlansStatus.failure,
        errorMessage: error.toString(),
      );
    }
  }

  void selectPlan(int planId, String durationType) {
    state = state.copyWith(
      selectedPlanId: planId,
      selectedDurationType: durationType,
    );
  }

  Future<void> purchaseSubscription() async {
    if (state.selectedPlanId == null || state.selectedDurationType == null) {
      state = state.copyWith(
        status: SubscriptionPlansStatus.purchaseFailure,
        errorMessage: 'Please select a plan and duration first',
      );
      return;
    }

    state = state.copyWith(status: SubscriptionPlansStatus.purchasing);

    try {
      final request = SubscriptionPurchaseRequestEntity(
        planId: state.selectedPlanId!,
        durationType: state.selectedDurationType!,
      );

      final paymentOrder = await createPaymentOrderUseCase.execute(request);

      state = state.copyWith(paymentOrder: paymentOrder);

      // Initialize Razorpay payment
      await _initiateRazorpayPayment(paymentOrder);
    } catch (error) {
      state = state.copyWith(
        status: SubscriptionPlansStatus.purchaseFailure,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> _initiateRazorpayPayment(PaymentOrderEntity paymentOrder) async {
    final selectedPlan = state.selectedPlan;
    if (selectedPlan == null) return;

    final userProfile = ref.read(userProfileProvider).user;
    final phoneNumber = userProfile?.phone ?? '';

    final options = {
      'key': paymentOrder.keyId,
      'amount': paymentOrder.order.amount,
      'currency': paymentOrder.order.currency,
      'order_id': paymentOrder.order.id,
      'name': 'Trees India',
      'description': 'Subscription: ${selectedPlan.name}',
      'prefill': {
        'contact': phoneNumber,
        'email': userProfile?.email ?? '',
      },
      'theme': {
        'color': '#055c3a',
      },
    };

    try {
      razorpay.open(options);
    } catch (e) {
      state = state.copyWith(
        status: SubscriptionPlansStatus.purchaseFailure,
        errorMessage: 'Failed to open payment gateway: ${e.toString()}',
      );
    }
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    final paymentOrder = state.paymentOrder;
    if (paymentOrder == null) {
      state = state.copyWith(
        status: SubscriptionPlansStatus.purchaseFailure,
        errorMessage: 'Payment order not found',
      );
      return;
    }

    try {
      final request = CompletePurchaseRequestEntity(
        paymentId: paymentOrder.payment.id,
        razorpayPaymentId: response.paymentId!,
        razorpaySignature: response.signature!,
      );

      final subscription =
          await completeSubscriptionPurchaseUseCase.execute(request);

      state = state.copyWith(
        status: SubscriptionPlansStatus.purchaseSuccess,
        purchasedSubscription: subscription,
        errorMessage: null,
      );
    } catch (error) {
      state = state.copyWith(
        status: SubscriptionPlansStatus.purchaseFailure,
        errorMessage: 'Failed to complete purchase: ${error.toString()}',
      );
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    state = state.copyWith(
      status: SubscriptionPlansStatus.purchaseFailure,
      errorMessage: 'Payment failed: ${response.message}',
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    state = state.copyWith(
      status: SubscriptionPlansStatus.purchaseFailure,
      errorMessage: 'External wallet payments are not supported',
    );
  }

  void clearError() {
    state = state.clearError();
  }

  void clearPaymentOrder() {
    state = state.clearPaymentOrder();
  }

  void resetPurchaseState() {
    state = state.copyWith(
      status: SubscriptionPlansStatus.success,
      paymentOrder: null,
      purchasedSubscription: null,
      errorMessage: null,
      selectedPlanId: null,
      selectedDurationType: null,
    );
  }
}
