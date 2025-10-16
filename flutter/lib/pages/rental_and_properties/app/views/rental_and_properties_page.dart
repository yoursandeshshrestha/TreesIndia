import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/connectivity/connectivity_provider.dart';
import 'package:trees_india/commons/presenters/providers/notification_service_provider.dart';
import '../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../commons/constants/app_colors.dart';
import '../../../../commons/constants/app_spacing.dart';
import '../providers/property_providers.dart';
import 'widgets/property_grid_widget.dart';
import 'widgets/property_type_tabs_widget.dart';
import 'widgets/applied_filters_widget.dart';
import 'widgets/property_bottom_bar_widget.dart';

class RentalAndPropertiesPage extends ConsumerStatefulWidget {
  const RentalAndPropertiesPage({super.key});

  @override
  ConsumerState<RentalAndPropertiesPage> createState() => _RentalAndPropertiesPageState();
}

class _RentalAndPropertiesPageState extends ConsumerState<RentalAndPropertiesPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(propertyNotifierProvider.notifier).loadProperties();
    });
  }

  Widget _buildToggleSwitch(bool enabled, VoidCallback onToggle) {
    return GestureDetector(
      onTap: onToggle,
      child: Container(
        width: 44,
        height: 24,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: enabled ? AppColors.stateGreen600 : Colors.grey[300],
        ),
        child: AnimatedAlign(
          duration: const Duration(milliseconds: 200),
          alignment: enabled ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            width: 20,
            height: 20,
            margin: const EdgeInsets.symmetric(horizontal: 2),
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final propertyState = ref.watch(propertyNotifierProvider);
    final isConnected = ref.watch(connectivityNotifierProvider);
    if (!isConnected) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(notificationServiceProvider).showOfflineMessage(
              context,
              onRetry: () => debugPrint('Retrying…'),
            );
      });
    }

    return PopScope(
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) {
          // Invalidate the provider to reset its state
          ref.invalidate(propertyNotifierProvider);
        }
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          title: H3Bold(
            text: 'Rental & Properties',
            color: AppColors.brandNeutral900,
          ),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: AppColors.brandNeutral900),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
        body: Column(
          children: [
            // Property Type Tabs (All, Properties, Rental)
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.md,
              ),
              child: PropertyTypeTabsWidget(
                selectedType: propertyState.filters.listingType,
                onTypeSelected: (type) {
                  ref.read(propertyNotifierProvider.notifier).setListingType(type);
                },
              ),
            ),
      
            // Trees India Assured Toggle
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.sm,
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.verified,
                    color: AppColors.stateGreen600,
                    size: 20,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: B2Regular(
                      text: 'Assured by Trees India',
                      color: AppColors.brandNeutral700,
                    ),
                  ),
                  _buildToggleSwitch(
                    propertyState.filters.uploadedByAdmin ?? false,
                    () {
                      final currentValue = propertyState.filters.uploadedByAdmin ?? false;
                      ref.read(propertyNotifierProvider.notifier)
                          .setTreesIndiaAssured(!currentValue ? true : null);
                    },
                  ),
                ],
              ),
            ),
      
            // Applied Filters
            AppliedFiltersWidget(
              filters: propertyState.filters,
              onRemoveFilter: (filterType, value) {
                ref.read(propertyNotifierProvider.notifier)
                    .removeFilter(filterType, value);
              },
              onClearAll: () {
                ref.read(propertyNotifierProvider.notifier).clearAllFilters();
              },
            ),
      
            // Main Content - Properties Grid
            Expanded(
              child: PropertyGridWidget(
                properties: propertyState.properties,
                isLoading: propertyState.isLoading,
                hasError: propertyState.isFailure,
                errorMessage: propertyState.errorMessage,
                isEmpty: propertyState.isEmpty,
                hasMore: propertyState.hasNext,
                onLoadMore: () {
                  ref.read(propertyNotifierProvider.notifier).loadMoreProperties();
                },
                onRetry: () {
                  ref.read(propertyNotifierProvider.notifier).loadProperties();
                },
              ),
            ),
      
            // Bottom Bar
            PropertyBottomBarWidget(
              filters: propertyState.filters,
              onSortChanged: (sortType) {
                ref.read(propertyNotifierProvider.notifier).setSortBy(sortType);
              },
              onFiltersChanged: (newFilters) {
                ref.read(propertyNotifierProvider.notifier).updateFilters(newFilters);
              },
            ),
          ],
        ),
      ),
    );
  }
}