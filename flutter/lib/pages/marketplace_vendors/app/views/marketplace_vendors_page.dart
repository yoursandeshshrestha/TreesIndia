import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../commons/constants/app_colors.dart';
import '../providers/vendor_providers.dart';
import 'widgets/vendor_applied_filters_widget.dart';
import 'widgets/vendor_bottom_bar_widget.dart';
import 'widgets/vendor_grid_widget.dart';

class MarketplaceVendorsPage extends ConsumerStatefulWidget {
  const MarketplaceVendorsPage({super.key});

  @override
  ConsumerState<MarketplaceVendorsPage> createState() =>
      _MarketplaceVendorsPageState();
}

class _MarketplaceVendorsPageState
    extends ConsumerState<MarketplaceVendorsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(vendorNotifierProvider.notifier).loadVendors();
    });
  }

  @override
  Widget build(BuildContext context) {
    final vendorState = ref.watch(vendorNotifierProvider);

    return PopScope(
      onPopInvokedWithResult: (didPop, result) {
        ref.invalidate(vendorNotifierProvider);
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          title: H3Bold(
            text: 'Vendors',
            color: AppColors.brandNeutral900,
          ),
          leading: IconButton(
            icon:
                const Icon(Icons.arrow_back, color: AppColors.brandNeutral900),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
        body: Column(
          children: [
            // Applied Filters - only show if there are active filters
            VendorAppliedFiltersWidget(
              filters: vendorState.filters,
              onRemoveFilter: (filterType, value) {
                ref
                    .read(vendorNotifierProvider.notifier)
                    .removeFilter(filterType, value);
              },
              onClearAll: () {
                ref.read(vendorNotifierProvider.notifier).clearAllFilters();
              },
            ),
        
            // Vendors Grid
            Expanded(
              child: VendorGridWidget(
                vendors: vendorState.vendors,
                status: vendorState.status,
                hasReachedMax: vendorState.hasReachedMax,
                errorMessage: vendorState.errorMessage,
                onLoadMore: () {
                  ref.read(vendorNotifierProvider.notifier).loadVendors();
                },
                onRefresh: () {
                  ref
                      .read(vendorNotifierProvider.notifier)
                      .loadVendors(isRefresh: true);
                },
              ),
            ),
          ],
        ),
        bottomNavigationBar: VendorBottomBarWidget(
          filters: vendorState.filters,
          onSortChanged: (sortType) {
            ref.read(vendorNotifierProvider.notifier).setSortBy(sortType);
          },
          onFiltersChanged: (newFilters) {
            final notifier = ref.read(vendorNotifierProvider.notifier);

            // Apply all filter changes
            if (newFilters.businessType != vendorState.filters.businessType) {
              notifier.setBusinessType(newFilters.businessType);
            }

            if (newFilters.services != vendorState.filters.services) {
              notifier.setServices(newFilters.services);
            }

            if (newFilters.location != vendorState.filters.location) {
              notifier.setLocation(newFilters.location);
            }

            if (newFilters.city != vendorState.filters.city) {
              notifier.setCity(newFilters.city);
            }

            if (newFilters.state != vendorState.filters.state) {
              notifier.setState(newFilters.state);
            }
          },
        ),
      ),
    );
  }
}
