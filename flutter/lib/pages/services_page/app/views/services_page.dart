import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../commons/constants/app_colors.dart';
import '../../../../commons/constants/app_spacing.dart';
import '../../../home_page/domain/entities/subcategory_entity.dart';
import '../../domain/entities/service_detail_entity.dart';
import '../providers/service_providers.dart';
import '../viewmodels/service_state.dart';
import 'widgets/service_card.dart';
import 'widgets/service_loading_skeleton.dart';

class ServicesPage extends ConsumerStatefulWidget {
  final String? categoryId;
  final String? subcategoryId;

  const ServicesPage({
    super.key,
    this.categoryId,
    this.subcategoryId,
  });

  @override
  ConsumerState<ServicesPage> createState() => _ServicesPageState();
}

class _ServicesPageState extends ConsumerState<ServicesPage> {
  late ScrollController _scrollController;
  bool _isLoadingMore = false;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);

    // Initialize and load services
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final intCategoryId = int.tryParse(
          widget.categoryId != null ? '${widget.categoryId}' : '0');
      final intSubcategoryId = int.tryParse(
          widget.subcategoryId != null ? '${widget.subcategoryId}' : '0');

      if (kDebugMode) {
        print(
          'ServicesPage: 🔍 Category ID: $intCategoryId, Subcategory ID: $intSubcategoryId');
      }
      // Set category and subcategory in services page state
      ref
          .read(serviceNotifierProvider.notifier)
          .setCategoryAndSubcategoryIds(intCategoryId, intSubcategoryId);
      ref.read(serviceNotifierProvider.notifier).initializeAndLoadServices();
    });
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      _loadMoreServices();
    }
  }

  Future<void> _loadMoreServices() async {
    if (_isLoadingMore) return;

    final serviceState = ref.read(serviceNotifierProvider);
    if (!serviceState.hasMoreServices) return;

    setState(() {
      _isLoadingMore = true;
    });

    await ref.read(serviceNotifierProvider.notifier).loadMoreServices();

    if (mounted) {
      setState(() {
        _isLoadingMore = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final serviceState = ref.watch(serviceNotifierProvider);


    return PopScope(
      onPopInvokedWithResult: (didPop, result) {
        ref.invalidate(serviceNotifierProvider);
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: AppColors.white,
          foregroundColor: AppColors.brandNeutral800,
          elevation: 0,
          titleSpacing: 0,
          automaticallyImplyLeading: true,
          leading: IconButton(
            icon: const Icon(
              Icons.chevron_left,
              color: AppColors.brandNeutral800,
              size: 28,
            ),
            onPressed: () => Navigator.of(context).pop(),
          ),
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(1),
            child: Container(
              height: 1,
              color: AppColors.brandNeutral200,
            ),
          ),
          title: serviceState.currentSubcategory != null
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    H3Bold(
                      text: serviceState.currentSubcategory!.name,
                      color: AppColors.brandNeutral900,
                      textAlign: TextAlign.center,
                    ),
                    if (serviceState.currentCategory != null)
                      B3Regular(
                        text: serviceState.currentCategory!.name,
                        color: AppColors.brandNeutral600,
                        textAlign: TextAlign.center,
                      ),
                  ],
                )
              : H3Bold(
                  text: 'All Services',
                  color: AppColors.brandNeutral900,
                ),
        ),
        body: _buildBody(serviceState),
      ),
    );
  }

  Widget _buildBody(ServiceState serviceState) {
    switch (serviceState.status) {
      case ServiceStatus.loading:
        return const ServiceLoadingSkeleton();

      case ServiceStatus.failure:
        return _buildErrorState(serviceState.errorMessage);

      case ServiceStatus.success:
        if (serviceState.services.isEmpty) {
          return _buildEmptyState();
        }
        return _buildServicesList(serviceState);

      default:
        return const ServiceLoadingSkeleton();
    }
  }

  Widget _buildServicesList(ServiceState serviceState) {
    return Column(
      children: [
        // Level 3 Categories Section (if available)
        if (serviceState.level3Categories.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.md),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: AppSpacing.sm,
                mainAxisSpacing: AppSpacing.sm,
                childAspectRatio: 2.8,
              ),
              itemCount: serviceState.level3Categories.length,
              itemBuilder: (context, index) {
                final level3Category = serviceState.level3Categories[index];
                final isSelected = serviceState.currentSubcategoryId == level3Category.id;
                return _buildLevel3CategoryChip(
                  level3Category,
                  isSelected,
                  () {
                    // Toggle selection: if already selected, deselect (show all)
                    final newSelection = isSelected ? null : level3Category.id;
                    ref
                        .read(serviceNotifierProvider.notifier)
                        .selectLevel3Category(newSelection);
                  },
                );
              },
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
        ],

        // Services count header - show dynamic count based on filtered services
        Builder(
          builder: (context) {
            int serviceCount = serviceState.services.length;
            
            // If Level 3 category is selected, count only filtered services
            if (serviceState.level3Categories.isNotEmpty) {
              final selectedLevel3Id = serviceState.currentSubcategoryId;
              final isLevel3Selected = selectedLevel3Id != null &&
                  selectedLevel3Id != 0 &&
                  serviceState.level3Categories.any((cat) => cat.id == selectedLevel3Id);
              
              if (isLevel3Selected) {
                // Count services for selected Level 3 category
                serviceCount = serviceState.services
                    .where((service) => service.categoryId == selectedLevel3Id)
                    .length;
              }
            }
            
            return Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.xs,
              ),
              color: AppColors.brandNeutral50,
              child: B3Regular(
                text: '$serviceCount ${serviceCount == 1 ? 'service' : 'services'} found',
                color: AppColors.brandNeutral600,
              ),
            );
          },
        ),

        // Services list - grouped by Level 3 category
        Expanded(
          child: _buildGroupedServicesList(serviceState),
        ),
      ],
    );
  }

  Widget _buildLevel3CategoryChip(
    SubcategoryEntity category,
    bool isSelected,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF055c3a)
              : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF055c3a)
                : AppColors.brandNeutral200,
            width: 1,
          ),
        ),
        child: Center(
          child: B3Regular(
            text: category.name,
            color: isSelected
                ? Colors.white
                : AppColors.brandNeutral900,
          ),
        ),
      ),
    );
  }

  Widget _buildGroupedServicesList(ServiceState serviceState) {
    // If Level 3 categories exist, group services by Level 3 category
    if (serviceState.level3Categories.isNotEmpty) {
      // Check if a specific Level 3 category is selected
      final selectedLevel3Id = serviceState.currentSubcategoryId;
      final isLevel3Selected = selectedLevel3Id != null &&
          selectedLevel3Id != 0 &&
          serviceState.level3Categories.any((cat) => cat.id == selectedLevel3Id);

      if (isLevel3Selected) {
        // Show only services for the selected Level 3 category
        // Services are associated with Level 3 categories via categoryId
        final filteredServices = serviceState.services
            .where((service) => service.categoryId == selectedLevel3Id)
            .toList();

        return ListView.builder(
          controller: _scrollController,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
          itemCount: filteredServices.length + (_isLoadingMore ? 1 : 0),
          itemBuilder: (context, index) {
            if (index >= filteredServices.length) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
                child: const Center(child: CircularProgressIndicator()),
              );
            }

            final service = filteredServices[index];
            return Container(
              margin: const EdgeInsets.only(bottom: AppSpacing.md),
              child: ServiceCard(
                service: service,
                onTap: () {
                  context.push(
                    '/service-detail/${service.id}',
                    extra: {'service': service},
                  );
                },
              ),
            );
          },
        );
      } else {
        // Group services by Level 3 category
        // Services are associated with Level 3 categories via categoryId
        final Map<int, List<ServiceDetailEntity>> groupedServices = {};
        
        for (final service in serviceState.services) {
          // Use categoryId which points to the Level 3 category
          final level3Id = service.categoryId;
          if (!groupedServices.containsKey(level3Id)) {
            groupedServices[level3Id] = [];
          }
          groupedServices[level3Id]!.add(service);
        }

        // Build list of items: category headers + services
        final List<Widget> items = [];
        int totalItems = 0;

        for (final level3Category in serviceState.level3Categories) {
          final servicesForCategory = groupedServices[level3Category.id] ?? [];
          if (servicesForCategory.isEmpty) continue;

          // Add category header
          items.add(
            Padding(
              padding: const EdgeInsets.only(
                top: AppSpacing.md,
                bottom: AppSpacing.sm,
              ),
              child: H4Bold(
                text: level3Category.name,
                color: AppColors.brandNeutral900,
              ),
            ),
          );
          totalItems++;

          // Add services for this category
          for (final service in servicesForCategory) {
            items.add(
              Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.md),
                child: ServiceCard(
                  service: service,
                  onTap: () {
                    context.push(
                      '/service-detail/${service.id}',
                      extra: {'service': service},
                    );
                  },
                ),
              ),
            );
            totalItems++;
          }
        }

        // Add loading indicator if needed
        if (_isLoadingMore) {
          items.add(
            Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
              child: const Center(child: CircularProgressIndicator()),
            ),
          );
          totalItems++;
        }

        return ListView.builder(
          controller: _scrollController,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
          itemCount: totalItems,
          itemBuilder: (context, index) => items[index],
        );
      }
    } else {
      // No Level 3 categories - show services normally
      return ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(AppSpacing.lg),
        itemCount: serviceState.services.length + (_isLoadingMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index >= serviceState.services.length) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
              child: const Center(child: CircularProgressIndicator()),
            );
          }

          final service = serviceState.services[index];
          return Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.lg),
            child: ServiceCard(
              service: service,
              onTap: () {
                context.push(
                  '/service-detail/${service.id}',
                  extra: {'service': service},
                );
              },
            ),
          );
        },
      );
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.search_off,
              size: 64,
              color: AppColors.brandNeutral400,
            ),
            const SizedBox(height: AppSpacing.lg),
            H3Bold(
              text: 'No Services Found',
              color: AppColors.brandNeutral600,
            ),
            const SizedBox(height: AppSpacing.sm),
            B2Regular(
              text: 'No services are available for this category in your area.',
              color: AppColors.brandNeutral500,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(String errorMessage) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.stateRed400,
            ),
            const SizedBox(height: AppSpacing.lg),
            H3Bold(
              text: 'Something went wrong',
              color: AppColors.brandNeutral600,
            ),
            const SizedBox(height: AppSpacing.sm),
            B2Regular(
              text: errorMessage.isNotEmpty
                  ? errorMessage
                  : 'Unable to load services. Please try again.',
              color: AppColors.brandNeutral500,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.lg),
            ElevatedButton(
              onPressed: () {
                ref
                    .read(serviceNotifierProvider.notifier)
                    .initializeAndLoadServices();
              },
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
