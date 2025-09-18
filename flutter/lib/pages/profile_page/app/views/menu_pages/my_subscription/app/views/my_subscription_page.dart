import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../providers/subscription_providers.dart';
import '../states/subscription_state.dart';
import 'widgets/active_subscription_card.dart';
import 'widgets/billing_history_card.dart';
import 'widgets/empty_subscription_state.dart';
import 'widgets/subscription_loading_skeleton.dart';

class MySubscriptionPage extends ConsumerStatefulWidget {
  const MySubscriptionPage({super.key});

  @override
  ConsumerState<MySubscriptionPage> createState() => _MySubscriptionPageState();
}

class _MySubscriptionPageState extends ConsumerState<MySubscriptionPage> {
  @override
  void initState() {
    super.initState();
    // Load subscription data when page opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(subscriptionNotifierProvider.notifier).loadSubscriptionData();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: const Text(
          'My Subscription',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.brandNeutral900,
          ),
        ),
        backgroundColor: AppColors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back,
            color: AppColors.brandNeutral600,
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Consumer(
        builder: (context, ref, child) {
          final subscriptionState = ref.watch(subscriptionNotifierProvider);

          return RefreshIndicator(
            onRefresh: () async {
              ref.read(subscriptionNotifierProvider.notifier).refreshSubscription();
            },
            child: _buildBody(subscriptionState),
          );
        },
      ),
    );
  }

  Widget _buildBody(SubscriptionState state) {
    if (state.status == SubscriptionStatus.loading && !state.isRefreshing) {
      return const SubscriptionLoadingSkeleton();
    }

    if (state.status == SubscriptionStatus.failure && !state.isRefreshing) {
      return _buildErrorState(state.errorMessage);
    }

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Active Subscription Section
          if (state.hasActiveSubscription) ...[
            ActiveSubscriptionCard(
              subscription: state.activeSubscription!,
            ),
            const SizedBox(height: AppSpacing.lg),
          ] else ...[
            const EmptySubscriptionState(),
            const SizedBox(height: AppSpacing.lg),
          ],

          // Buy Subscription Button
          if (!state.hasActiveSubscription || !state.isActiveSubscriptionValid) ...[
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  context.push('/subscription-plans');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.stateGreen600,
                  foregroundColor: AppColors.white,
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'Buy Subscription',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
          ],

          // Billing History Section
          if (state.subscriptionHistory.isNotEmpty) ...[
            const Text(
              'Billing History',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.brandNeutral900,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            ...state.subscriptionHistory.map(
              (subscription) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.md),
                child: BillingHistoryCard(subscription: subscription),
              ),
            ),
          ],

          // Refresh indicator space
          const SizedBox(height: AppSpacing.xl),
        ],
      ),
    );
  }

  Widget _buildErrorState(String? errorMessage) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.error.withOpacity(0.7),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              'Something went wrong',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.brandNeutral800,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              errorMessage ?? 'Failed to load subscription data',
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.brandNeutral600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.lg),
            ElevatedButton(
              onPressed: () {
                ref.read(subscriptionNotifierProvider.notifier).loadSubscriptionData();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.stateGreen600,
                foregroundColor: AppColors.white,
              ),
              child: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }
}