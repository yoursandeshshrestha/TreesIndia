import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/app_bar/app/views/custom_app_bar.dart';
import 'package:trees_india/commons/components/connectivity/connectivity_provider.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';
import 'package:trees_india/commons/presenters/providers/notification_service_provider.dart';

import '../providers/property_providers.dart';
import '../states/my_properties_state.dart';
import 'widgets/property_card.dart';
import 'widgets/add_property_button.dart';
import 'widgets/property_empty_state.dart';
import 'widgets/property_loading_skeleton.dart';
import 'widgets/add_property_bottom_sheet.dart';
import 'widgets/delete_confirmation_bottom_sheet.dart';

class MyPropertiesPage extends ConsumerStatefulWidget {
  const MyPropertiesPage({super.key});

  @override
  ConsumerState<MyPropertiesPage> createState() => _MyPropertiesPageState();
}

class _MyPropertiesPageState extends ConsumerState<MyPropertiesPage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    // Load properties when page initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(myPropertiesNotifierProvider.notifier)
          .loadProperties(refresh: true);
    });

    // Add scroll listener for pagination
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(myPropertiesNotifierProvider.notifier).loadMoreProperties();
    }
  }

  void _showAddPropertyBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const AddPropertyBottomSheet(),
    );
  }

  Future<void> _onRefresh() async {
    await ref
        .read(myPropertiesNotifierProvider.notifier)
        .loadProperties(refresh: true);
  }

  void _showDeleteConfirmation(int propertyId, String propertyTitle) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => DeleteConfirmationBottomSheet(
        propertyTitle: propertyTitle,
        onConfirm: () {
          Navigator.of(context).pop();

          ref
              .read(myPropertiesNotifierProvider.notifier)
              .deleteProperty(propertyId);
        },
        isDeleting:
            ref.watch(myPropertiesNotifierProvider).deletingPropertyId ==
                propertyId,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final propertiesState = ref.watch(myPropertiesNotifierProvider);
        final isConnected = ref.watch(connectivityNotifierProvider);
    if (!isConnected) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(notificationServiceProvider).showOfflineMessage(
              context,
              onRetry: () => debugPrint('Retrying…'),
            );
      });
    }

    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: const CustomAppBar(
        title: 'My Properties',
        backgroundColor: AppColors.white,
        iconColor: AppColors.brandNeutral800,
        titleColor: AppColors.brandNeutral800,
      ),
      body: Column(
        children: [
          AddPropertyButton(onPressed: _showAddPropertyBottomSheet),

          // Properties List
          Expanded(
            child: RefreshIndicator(
              onRefresh: _onRefresh,
              child: _buildContent(propertiesState),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(MyPropertiesState state) {
    switch (state.status) {
      case MyPropertiesStatus.initial:
      case MyPropertiesStatus.loading:
        if (state.properties.isEmpty) {
          return const PropertyLoadingSkeleton();
        }
        return _buildPropertyList(state);

      case MyPropertiesStatus.success:
      case MyPropertiesStatus.deleting:
        if (state.properties.isEmpty) {
          return const PropertyEmptyState();
        }
        return _buildPropertyList(state);

      case MyPropertiesStatus.failure:
        if (state.properties.isEmpty) {
          return _buildErrorState(state.errorMessage);
        }
        return _buildPropertyList(state);
    }
  }

  Widget _buildPropertyList(MyPropertiesState state) {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: state.properties.length + (state.hasMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == state.properties.length) {
          // Loading indicator for pagination
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
            child: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        final property = state.properties[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: PropertyCard(
            property: property,
            isDeleting: state.deletingPropertyId == property.id,
            onDelete: () =>
                _showDeleteConfirmation(property.id, property.title),
          ),
        );
      },
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
              color: AppColors.error,
            ),
            const SizedBox(height: AppSpacing.md),
            const Text(
              'Error Loading Properties',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.brandNeutral800,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              errorMessage,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.brandNeutral600,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            ElevatedButton(
              onPressed: () => ref
                  .read(myPropertiesNotifierProvider.notifier)
                  .loadProperties(refresh: true),
              child: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }
}
