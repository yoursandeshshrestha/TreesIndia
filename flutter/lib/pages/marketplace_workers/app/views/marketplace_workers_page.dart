import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../commons/constants/app_colors.dart';
import '../providers/worker_providers.dart';
import 'widgets/worker_applied_filters_widget.dart';
import 'widgets/worker_bottom_bar_widget.dart';
import 'widgets/worker_grid_widget.dart';

class MarketplaceWorkersPage extends ConsumerStatefulWidget {
  const MarketplaceWorkersPage({super.key});

  @override
  ConsumerState<MarketplaceWorkersPage> createState() =>
      _MarketplaceWorkersPageState();
}

class _MarketplaceWorkersPageState
    extends ConsumerState<MarketplaceWorkersPage> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(workerNotifierProvider.notifier).loadWorkers();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final workerState = ref.watch(workerNotifierProvider);

    return PopScope(
      onPopInvokedWithResult: (didPop, result) {
        ref.invalidate(workerNotifierProvider);
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          title: H3Bold(
            text: 'Workers',
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
            // Search Bar
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search Workers',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        const BorderSide(color: AppColors.brandNeutral200),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        const BorderSide(color: AppColors.brandNeutral200),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        const BorderSide(color: AppColors.stateGreen600),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                ),
                onSubmitted: (value) {
                  ref
                      .read(workerNotifierProvider.notifier)
                      .setSearch(value.isNotEmpty ? value : null);
                },
              ),
            ),
        
            // Applied Filters - only show if there are active filters
            WorkerAppliedFiltersWidget(
              filters: workerState.filters,
              onRemoveFilter: (filterType, value) {
                ref
                    .read(workerNotifierProvider.notifier)
                    .removeFilter(filterType, value);
              },
              onClearAll: () {
                ref.read(workerNotifierProvider.notifier).clearAllFilters();
                _searchController.clear();
              },
            ),
        
            // Workers Grid
            Expanded(
              child: WorkerGridWidget(
                workers: workerState.workers,
                status: workerState.status,
                hasReachedMax: workerState.hasReachedMax,
                errorMessage: workerState.errorMessage,
                onLoadMore: () {
                  ref.read(workerNotifierProvider.notifier).loadWorkers();
                },
                onRefresh: () {
                  ref
                      .read(workerNotifierProvider.notifier)
                      .loadWorkers(isRefresh: true);
                },
              ),
            ),
          ],
        ),
        bottomNavigationBar: WorkerBottomBarWidget(
          filters: workerState.filters,
          onSortChanged: (sortType) {
            ref.read(workerNotifierProvider.notifier).setSortBy(sortType);
          },
          onFiltersChanged: (newFilters) {
            final notifier = ref.read(workerNotifierProvider.notifier);

            // Apply all filter changes
            if (newFilters.workerType != workerState.filters.workerType) {
              notifier.setWorkerType(newFilters.workerType);
            }

            if (newFilters.skills != workerState.filters.skills) {
              notifier.setSkills(newFilters.skills);
            }

            if (newFilters.minExperience != workerState.filters.minExperience ||
                newFilters.maxExperience != workerState.filters.maxExperience) {
              notifier.setExperienceRange(
                newFilters.minExperience,
                newFilters.maxExperience,
              );
            }
          },
        ),
      ),
    );
  }
}
