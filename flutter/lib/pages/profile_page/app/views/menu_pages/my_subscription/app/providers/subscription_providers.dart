import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../../../../../../../commons/presenters/providers/dio_provider.dart';
import '../../../../../../../../commons/presenters/providers/error_handler_provider.dart';

// Data layer providers
import '../../data/datasources/subscription_remote_datasource.dart';
import '../../data/repositories/subscription_repository_impl.dart';

// Domain layer providers
import '../../domain/repositories/subscription_repository.dart';
import '../../domain/usecases/get_my_subscription_usecase.dart';
import '../../domain/usecases/get_subscription_history_usecase.dart';
import '../../domain/usecases/get_subscription_plans_usecase.dart';
import '../../domain/usecases/create_payment_order_usecase.dart';
import '../../domain/usecases/complete_subscription_purchase_usecase.dart';

// Application layer providers
import '../states/subscription_state.dart';
import '../states/subscription_plans_state.dart';
import '../notifiers/subscription_notifier.dart';
import '../notifiers/subscription_plans_notifier.dart';

// Data Source Provider
final subscriptionRemoteDataSourceProvider =
    Provider<SubscriptionRemoteDataSource>((ref) {
  final dioClient = ref.read(dioClientProvider);
  final errorHandler = ref.read(errorHandlerProvider);

  return SubscriptionRemoteDataSource(
    dioClient: dioClient,
    errorHandler: errorHandler,
  );
});

// Repository Provider
final subscriptionRepositoryProvider = Provider<SubscriptionRepository>((ref) {
  final remoteDataSource = ref.watch(subscriptionRemoteDataSourceProvider);

  return SubscriptionRepositoryImpl(
    remoteDataSource: remoteDataSource,
  );
});

// Use Case Providers
final getMySubscriptionUseCaseProvider =
    Provider<GetMySubscriptionUseCase>((ref) {
  final repository = ref.watch(subscriptionRepositoryProvider);
  return GetMySubscriptionUseCase(repository: repository);
});

final getSubscriptionHistoryUseCaseProvider =
    Provider<GetSubscriptionHistoryUseCase>((ref) {
  final repository = ref.watch(subscriptionRepositoryProvider);
  return GetSubscriptionHistoryUseCase(repository: repository);
});

final getSubscriptionPlansUseCaseProvider =
    Provider<GetSubscriptionPlansUseCase>((ref) {
  final repository = ref.watch(subscriptionRepositoryProvider);
  return GetSubscriptionPlansUseCase(repository: repository);
});

final createPaymentOrderUseCaseProvider =
    Provider<CreatePaymentOrderUseCase>((ref) {
  final repository = ref.watch(subscriptionRepositoryProvider);
  return CreatePaymentOrderUseCase(repository: repository);
});

final completeSubscriptionPurchaseUseCaseProvider =
    Provider<CompleteSubscriptionPurchaseUseCase>((ref) {
  final repository = ref.watch(subscriptionRepositoryProvider);
  return CompleteSubscriptionPurchaseUseCase(repository: repository);
});

// Razorpay Provider
final razorpayProvider = Provider<Razorpay>((ref) {
  return Razorpay();
});

// Notifier Providers
final subscriptionNotifierProvider =
    StateNotifierProvider<SubscriptionNotifier, SubscriptionState>((ref) {
  final getMySubscriptionUseCase = ref.watch(getMySubscriptionUseCaseProvider);
  final getSubscriptionHistoryUseCase =
      ref.watch(getSubscriptionHistoryUseCaseProvider);

  return SubscriptionNotifier(
    getMySubscriptionUseCase: getMySubscriptionUseCase,
    getSubscriptionHistoryUseCase: getSubscriptionHistoryUseCase,
  );
});

final subscriptionPlansNotifierProvider =
    StateNotifierProvider<SubscriptionPlansNotifier, SubscriptionPlansState>(
        (ref) {
  final getSubscriptionPlansUseCase =
      ref.watch(getSubscriptionPlansUseCaseProvider);
  final createPaymentOrderUseCase =
      ref.watch(createPaymentOrderUseCaseProvider);
  final completeSubscriptionPurchaseUseCase =
      ref.watch(completeSubscriptionPurchaseUseCaseProvider);
  final razorpay = ref.watch(razorpayProvider);

  return SubscriptionPlansNotifier(
    getSubscriptionPlansUseCase: getSubscriptionPlansUseCase,
    createPaymentOrderUseCase: createPaymentOrderUseCase,
    completeSubscriptionPurchaseUseCase: completeSubscriptionPurchaseUseCase,
    razorpay: razorpay,
    ref: ref,
  );
});
