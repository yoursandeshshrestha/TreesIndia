import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import '../providers/subscription_providers.dart';
import '../states/subscription_plans_state.dart';
import 'widgets/subscription_plan_card.dart';
import 'widgets/subscription_loading_skeleton.dart';

class SubscriptionPlansListingPage extends ConsumerStatefulWidget {
  const SubscriptionPlansListingPage({super.key});

  @override
  ConsumerState<SubscriptionPlansListingPage> createState() => _SubscriptionPlansListingPageState();
}

class _SubscriptionPlansListingPageState extends ConsumerState<SubscriptionPlansListingPage> {
  @override
  void initState() {
    super.initState();
    // Load subscription plans when page opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(subscriptionPlansNotifierProvider.notifier).loadSubscriptionPlans();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: const Text(
          'Subscription Plans',
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
          final plansState = ref.watch(subscriptionPlansNotifierProvider);

          // Listen for purchase success
          ref.listen<SubscriptionPlansState>(
            subscriptionPlansNotifierProvider,
            (previous, current) {
              if (current.hasPurchased) {
                _handlePurchaseSuccess();
              } else if (current.hasError && current.errorMessage != null) {
                _showErrorSnackBar(current.errorMessage!);
              }
            },
          );

          return _buildBody(plansState);
        },
      ),
    );
  }

  Widget _buildBody(SubscriptionPlansState state) {
    if (state.isLoading) {
      return const SubscriptionLoadingSkeleton();
    }

    if (state.status == SubscriptionPlansStatus.failure) {
      return _buildErrorState(state.errorMessage);
    }

    if (state.plans.isEmpty) {
      return _buildEmptyPlansState();
    }

    return Column(
      children: [
        // Save 30% banner
        Container(
          margin: const EdgeInsets.all(AppSpacing.md),
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          decoration: BoxDecoration(
            color: AppColors.stateGreen100,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.stateGreen200),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.savings_outlined,
                color: AppColors.stateGreen700,
                size: 20,
              ),
              SizedBox(width: AppSpacing.sm),
              Text(
                'Save 30% with Yearly Plan',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.stateGreen700,
                ),
              ),
            ],
          ),
        ),

        // Plans list
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            itemCount: state.plans.length,
            itemBuilder: (context, index) {
              final plan = state.plans[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.md),
                child: SubscriptionPlanCard(
                  plan: plan,
                  isSelected: state.selectedPlanId == plan.id,
                  selectedDurationType: state.selectedDurationType,
                  onPlanSelected: (planId, durationType) {
                    ref.read(subscriptionPlansNotifierProvider.notifier)
                        .selectPlan(planId, durationType);
                  },
                ),
              );
            },
          ),
        ),

        // Purchase button
        if (state.selectedPlanId != null && state.selectedDurationType != null)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: const BoxDecoration(
              color: AppColors.white,
              border: Border(
                top: BorderSide(color: AppColors.brandNeutral200),
              ),
            ),
            child: ElevatedButton(
              onPressed: state.isPurchasing
                  ? null
                  : () {
                      ref.read(subscriptionPlansNotifierProvider.notifier)
                          .purchaseSubscription();
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.stateGreen600,
                foregroundColor: AppColors.white,
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: state.isPurchasing
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppColors.white,
                      ),
                    )
                  : Text(
                      'Purchase ${state.selectedPlanPrice != null ? "₹${state.selectedPlanPrice!.toStringAsFixed(0)}" : "Plan"}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),
      ],
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
              color: AppColors.error.withValues(alpha: 0.7),
            ),
            const SizedBox(height: AppSpacing.md),
            const Text(
              'Failed to load plans',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.brandNeutral800,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              errorMessage ?? 'Something went wrong',
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.brandNeutral600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.lg),
            ElevatedButton(
              onPressed: () {
                ref.read(subscriptionPlansNotifierProvider.notifier)
                    .loadSubscriptionPlans();
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

  Widget _buildEmptyPlansState() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.subscriptions_outlined,
              size: 64,
              color: AppColors.brandNeutral400,
            ),
            SizedBox(height: AppSpacing.md),
            Text(
              'No Plans Available',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.brandNeutral800,
              ),
            ),
            SizedBox(height: AppSpacing.sm),
            Text(
              'There are no subscription plans available at the moment.',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.brandNeutral600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  void _handlePurchaseSuccess() {
    // Refresh the main subscription page
    ref.read(subscriptionNotifierProvider.notifier).refreshSubscription();

    // Show success message and navigate back
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Subscription purchased successfully!'),
        backgroundColor: AppColors.stateGreen600,
      ),
    );

    // Navigate back to subscription page
    context.pop();
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
      ),
    );
  }
}