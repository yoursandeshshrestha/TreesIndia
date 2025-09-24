import 'package:equatable/equatable.dart';
import '../../domain/entities/subscription_entity.dart';

enum SubscriptionStatus { initial, loading, success, failure }

class SubscriptionState extends Equatable {
  final SubscriptionStatus status;
  final SubscriptionEntity? activeSubscription;
  final List<SubscriptionEntity> subscriptionHistory;
  final String? errorMessage;
  final bool isRefreshing;

  const SubscriptionState({
    this.status = SubscriptionStatus.initial,
    this.activeSubscription,
    this.subscriptionHistory = const [],
    this.errorMessage,
    this.isRefreshing = false,
  });

  SubscriptionState copyWith({
    SubscriptionStatus? status,
    SubscriptionEntity? activeSubscription,
    List<SubscriptionEntity>? subscriptionHistory,
    String? errorMessage,
    bool? isRefreshing,
    bool makeActiveSubscriptionNull = false,
  }) {
    return SubscriptionState(
      status: status ?? this.status,
      activeSubscription: makeActiveSubscriptionNull
          ? null
          : activeSubscription ?? this.activeSubscription,
      subscriptionHistory: subscriptionHistory ?? this.subscriptionHistory,
      errorMessage: errorMessage,
      isRefreshing: isRefreshing ?? this.isRefreshing,
    );
  }

  SubscriptionState clearActiveSubscription() {
    return SubscriptionState(
      status: status,
      activeSubscription: null,
      subscriptionHistory: subscriptionHistory,
      errorMessage: errorMessage,
      isRefreshing: isRefreshing,
    );
  }

  bool get hasActiveSubscription => activeSubscription != null;

  bool get isActiveSubscriptionValid {
    if (activeSubscription == null) return false;
    return activeSubscription!.isActive;
  }

  @override
  List<Object?> get props => [
        status,
        activeSubscription,
        subscriptionHistory,
        errorMessage,
        isRefreshing,
      ];
}