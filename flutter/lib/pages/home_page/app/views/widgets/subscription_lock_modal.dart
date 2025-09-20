import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/components/button/app/views/solid_button_widget.dart';
import 'package:trees_india/commons/components/text/app/views/custom_text_library.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/presenters/providers/stats_usecase_providers.dart';

enum MarketplaceType { projects, vendors, workers }

class SubscriptionLockModal extends ConsumerStatefulWidget {
  final MarketplaceType type;

  const SubscriptionLockModal({
    super.key,
    required this.type,
  });

  @override
  ConsumerState<SubscriptionLockModal> createState() =>
      _SubscriptionLockModalState();
}

class _SubscriptionLockModalState extends ConsumerState<SubscriptionLockModal> {
  bool _isLoading = true;
  String? _errorMessage;
  int _activeCount = 0;
  int _totalCount = 0;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      switch (widget.type) {
        case MarketplaceType.projects:
          final response =
              await ref.read(getProjectsStatsUsecaseProvider).call();
          if (response.success && response.data != null) {
            setState(() {
              _activeCount = response.data!.active;
              _totalCount = response.data!.total;
            });
          }
          break;
        case MarketplaceType.vendors:
          final response =
              await ref.read(getVendorsStatsUsecaseProvider).call();
          if (response.success && response.data != null) {
            setState(() {
              _activeCount = response.data!.activeVendors;
              _totalCount = response.data!.totalVendors;
            });
          }
          break;
        case MarketplaceType.workers:
          final response =
              await ref.read(getWorkersStatsUsecaseProvider).call();
          if (response.success && response.data != null) {
            setState(() {
              _activeCount = response.data!.activeWorkers;
              _totalCount = response.data!.totalWorkers;
            });
          }
          break;
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load stats: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  String _getTitle() {
    switch (widget.type) {
      case MarketplaceType.projects:
        return 'Projects';
      case MarketplaceType.vendors:
        return 'Vendors';
      case MarketplaceType.workers:
        return 'Workers';
    }
  }

  String _getDescription() {
    switch (widget.type) {
      case MarketplaceType.projects:
        return 'Explore construction and development projects';
      case MarketplaceType.vendors:
        return 'Connect with trusted vendors and service providers';
      case MarketplaceType.workers:
        return 'Find and hire skilled workers';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.brandNeutral300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Lock icon
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5F5),
              borderRadius: BorderRadius.circular(40),
            ),
            child: const Icon(
              Icons.lock_outline,
              size: 40,
              color: AppColors.brandNeutral600,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Title
          H3Bold(
            text: 'Subscription Required for ${_getTitle()}',
            color: AppColors.brandNeutral900,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.sm),

          // Description
          B2Regular(
            text:
                'You need an active subscription to view and access ${_getTitle().toLowerCase()} profiles.',
            color: AppColors.brandNeutral600,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.xl),

          // Stats section
          if (_isLoading)
            const CircularProgressIndicator()
          else if (_errorMessage != null)
            B2Regular(
              text: _errorMessage!,
              color: AppColors.stateRed600,
              textAlign: TextAlign.center,
            )
          else
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: const Color(0xFFF8F9FA),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE3F2FD),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          _getIconForType(),
                          size: 24,
                          color: const Color(0xFF1976D2),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            H4Bold(
                              text: '$_activeCount',
                              color: AppColors.brandNeutral900,
                            ),
                            B3Regular(
                              text: '${_getTitle()} Available',
                              color: AppColors.brandNeutral600,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

          const SizedBox(height: AppSpacing.xl),

          // Get Subscription button
          SizedBox(
            width: double.infinity,
            child: SolidButtonWidget(
              label: 'Get Subscription',
              onPressed: () {
                Navigator.of(context).pop();
                context.push('/subscription-plans');
              },
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
        ],
      ),
    );
  }

  IconData _getIconForType() {
    switch (widget.type) {
      case MarketplaceType.projects:
        return Icons.construction_outlined;
      case MarketplaceType.vendors:
        return Icons.business_outlined;
      case MarketplaceType.workers:
        return Icons.person_outline;
    }
  }
}
