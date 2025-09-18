import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../states/subscription_state.dart';
import '../../domain/entities/subscription_entity.dart';
import '../../domain/usecases/get_my_subscription_usecase.dart';
import '../../domain/usecases/get_subscription_history_usecase.dart';

class SubscriptionNotifier extends StateNotifier<SubscriptionState> {
  final GetMySubscriptionUseCase getMySubscriptionUseCase;
  final GetSubscriptionHistoryUseCase getSubscriptionHistoryUseCase;

  SubscriptionNotifier({
    required this.getMySubscriptionUseCase,
    required this.getSubscriptionHistoryUseCase,
  }) : super(const SubscriptionState());

  Future<void> loadSubscriptionData({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(isRefreshing: true);
    } else {
      state = state.copyWith(status: SubscriptionStatus.loading);
    }

    try {
      // Load both active subscription and history in parallel
      final results = await Future.wait([
        getMySubscriptionUseCase.execute(),
        getSubscriptionHistoryUseCase.execute(),
      ]);

      final activeSubscription = results[0] as SubscriptionEntity?;
      final subscriptionHistory = results[1] as List<SubscriptionEntity>;

      state = state.copyWith(
        status: SubscriptionStatus.success,
        activeSubscription: activeSubscription,
        makeActiveSubscriptionNull: activeSubscription == null,
        subscriptionHistory: subscriptionHistory,
        errorMessage: null,
        isRefreshing: false,
      );
    } catch (error) {
      state = state.copyWith(
        status: SubscriptionStatus.failure,
        errorMessage: error.toString(),
        isRefreshing: false,
      );
    }
  }

  Future<void> loadActiveSubscription() async {
    try {
      final activeSubscription = await getMySubscriptionUseCase.execute();
      state = state.copyWith(
        activeSubscription: activeSubscription,
        errorMessage: null,
      );
    } catch (error) {
      state = state.copyWith(
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> loadSubscriptionHistory() async {
    try {
      final subscriptionHistory = await getSubscriptionHistoryUseCase.execute();
      state = state.copyWith(
        subscriptionHistory: subscriptionHistory,
        errorMessage: null,
      );
    } catch (error) {
      state = state.copyWith(
        errorMessage: error.toString(),
      );
    }
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }

  void refreshSubscription() {
    loadSubscriptionData(refresh: true);
  }
}
