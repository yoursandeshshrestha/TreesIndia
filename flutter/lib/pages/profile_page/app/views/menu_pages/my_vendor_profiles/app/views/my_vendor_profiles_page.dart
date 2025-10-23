import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:trees_india/commons/components/app_bar/app/views/custom_app_bar.dart';
import 'package:trees_india/commons/constants/app_colors.dart';
import 'package:trees_india/commons/constants/app_spacing.dart';

import '../providers/vendor_providers.dart';
import '../states/my_vendor_profiles_state.dart';
import 'widgets/vendor_card.dart';
import 'widgets/add_vendor_button.dart';
import 'widgets/vendor_empty_state.dart';
import 'widgets/vendor_loading_skeleton.dart';
import 'widgets/add_vendor_bottom_sheet.dart';
import 'widgets/delete_confirmation_bottom_sheet.dart';

class MyVendorProfilesPage extends ConsumerStatefulWidget {
  const MyVendorProfilesPage({super.key});

  @override
  ConsumerState<MyVendorProfilesPage> createState() => _MyVendorProfilesPageState();
}

class _MyVendorProfilesPageState extends ConsumerState<MyVendorProfilesPage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    // Load vendor profiles when page initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(myVendorProfilesNotifierProvider.notifier)
          .loadVendors(refresh: true);
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
      ref.read(myVendorProfilesNotifierProvider.notifier).loadMoreVendors();
    }
  }

  void _showAddVendorBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const AddVendorBottomSheet(),
    );
  }

  Future<void> _onRefresh() async {
    await ref
        .read(myVendorProfilesNotifierProvider.notifier)
        .loadVendors(refresh: true);
  }

  void _showDeleteConfirmation(int vendorId, String vendorName) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => DeleteConfirmationBottomSheet(
        vendorName: vendorName,
        onConfirm: () {
          Navigator.of(context).pop();

          ref
              .read(myVendorProfilesNotifierProvider.notifier)
              .deleteVendor(vendorId);
        },
        isDeleting:
            ref.watch(myVendorProfilesNotifierProvider).deletingVendorId ==
                vendorId,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final vendorProfilesState = ref.watch(myVendorProfilesNotifierProvider);


    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: const CustomAppBar(
        title: 'My Vendor Profiles',
        backgroundColor: AppColors.white,
        iconColor: AppColors.brandNeutral800,
        titleColor: AppColors.brandNeutral800,
      ),
      body: Column(
        children: [
          AddVendorButton(onPressed: _showAddVendorBottomSheet),

          // Vendor Profiles List
          Expanded(
            child: RefreshIndicator(
              onRefresh: _onRefresh,
              child: _buildContent(vendorProfilesState),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(MyVendorProfilesState state) {
    switch (state.status) {
      case MyVendorProfilesStatus.initial:
      case MyVendorProfilesStatus.loading:
        if (state.vendors.isEmpty) {
          return const VendorLoadingSkeleton();
        }
        return _buildVendorList(state);

      case MyVendorProfilesStatus.success:
      case MyVendorProfilesStatus.deleting:
        if (state.vendors.isEmpty) {
          return const VendorEmptyState();
        }
        return _buildVendorList(state);

      case MyVendorProfilesStatus.failure:
        if (state.vendors.isEmpty) {
          return _buildErrorState(state.errorMessage);
        }
        return _buildVendorList(state);
    }
  }

  Widget _buildVendorList(MyVendorProfilesState state) {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: state.vendors.length + (state.hasMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == state.vendors.length) {
          // Loading indicator for pagination
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
            child: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        final vendor = state.vendors[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: VendorCard(
            vendor: vendor,
            isDeleting: state.deletingVendorId == vendor.id,
            onDelete: () =>
                _showDeleteConfirmation(vendor.id, vendor.vendorName),

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
              'Error Loading Vendor Profiles',
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
                  .read(myVendorProfilesNotifierProvider.notifier)
                  .loadVendors(refresh: true),
              child: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }
}
