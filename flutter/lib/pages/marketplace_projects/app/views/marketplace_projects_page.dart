import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../commons/constants/app_colors.dart';
import '../providers/project_providers.dart';
import 'widgets/project_applied_filters_widget.dart';
import 'widgets/project_bottom_bar_widget.dart';
import 'widgets/project_grid_widget.dart';

class MarketplaceProjectsPage extends ConsumerStatefulWidget {
  const MarketplaceProjectsPage({super.key});

  @override
  ConsumerState<MarketplaceProjectsPage> createState() =>
      _MarketplaceProjectsPageState();
}

class _MarketplaceProjectsPageState
    extends ConsumerState<MarketplaceProjectsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(projectNotifierProvider.notifier).loadProjects();
    });
  }

  @override
  Widget build(BuildContext context) {
    final projectState = ref.watch(projectNotifierProvider);

    return PopScope(
      onPopInvokedWithResult: (didPop, result) {
        ref.invalidate(projectNotifierProvider);
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          title: H3Bold(
            text: 'Projects',
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
            ProjectAppliedFiltersWidget(
              filters: projectState.filters,
              onRemoveFilter: (filterType, value) {
                ref
                    .read(projectNotifierProvider.notifier)
                    .removeFilter(filterType, value);
              },
              onClearAll: () {
                ref.read(projectNotifierProvider.notifier).clearAllFilters();
              },
            ),

            // Projects Grid
            Expanded(
              child: ProjectGridWidget(
                projects: projectState.projects,
                status: projectState.status,
                hasReachedMax: projectState.hasReachedMax,
                errorMessage: projectState.errorMessage,
                onLoadMore: () {
                  ref.read(projectNotifierProvider.notifier).loadProjects();
                },
                onRefresh: () {
                  ref
                      .read(projectNotifierProvider.notifier)
                      .loadProjects(isRefresh: true);
                },
              ),
            ),
          ],
        ),
        bottomNavigationBar: ProjectBottomBarWidget(
          filters: projectState.filters,
          onSortChanged: (sortType) {
            ref.read(projectNotifierProvider.notifier).setSortBy(sortType);
          },
          onFiltersChanged: (newFilters) {
            final notifier = ref.read(projectNotifierProvider.notifier);

            // Apply all filter changes
            if (newFilters.projectType != projectState.filters.projectType) {
              notifier.setProjectType(newFilters.projectType);
            }

            if (newFilters.status != projectState.filters.status) {
              notifier.setStatus(newFilters.status);
            }

            if (newFilters.city != projectState.filters.city) {
              notifier.setCity(newFilters.city);
            }

            if (newFilters.state != projectState.filters.state) {
              notifier.setState(newFilters.state);
            }
          },
        ),
      ),
    );
  }
}