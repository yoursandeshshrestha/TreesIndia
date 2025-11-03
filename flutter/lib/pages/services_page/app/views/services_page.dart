import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:trees_india/commons/components/app_bar/app/views/custom_app_bar.dart';
import '../../../../commons/components/text/app/views/custom_text_library.dart';
import '../../../../commons/constants/app_colors.dart';
import '../../../../commons/constants/app_spacing.dart';
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

      print(
          'ServicesPage: 🔍 Category ID: $intCategoryId, Subcategory ID: $intSubcategoryId');
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
        // Services count header
        if (serviceState.pagination != null)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md,
            ),
            color: AppColors.brandNeutral50,
            child: B3Regular(
              text: '${serviceState.pagination!.total} services found',
              color: AppColors.brandNeutral600,
            ),
          ),

        // Services list
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: serviceState.services.length + (_isLoadingMore ? 1 : 0),
            itemBuilder: (context, index) {
              if (index >= serviceState.services.length) {
                // Loading more indicator
                return Container(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: const Center(
                    child: CircularProgressIndicator(),
                  ),
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
                      extra: {
                        'service': service,
                      },
                    );
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
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
