import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/vendor_entity.dart';
import '../../domain/usecases/get_user_vendors_usecase.dart';
import '../../domain/usecases/delete_vendor_usecase.dart';
import '../states/my_vendor_profiles_state.dart';

class MyVendorProfilesNotifier extends StateNotifier<MyVendorProfilesState> {
  final GetUserVendorsUseCase getUserVendorsUseCase;
  final DeleteVendorUseCase deleteVendorUseCase;

  MyVendorProfilesNotifier({
    required this.getUserVendorsUseCase,
    required this.deleteVendorUseCase,
  }) : super(const MyVendorProfilesState());

  Future<void> loadVendors({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(
        status: MyVendorProfilesStatus.loading,
        currentPage: 1,
        hasMore: true,
      );
    } else if (state.status == MyVendorProfilesStatus.loading) {
      return; // Already loading
    } else {
      state = state.copyWith(status: MyVendorProfilesStatus.loading);
    }

    try {
      final vendors = await getUserVendorsUseCase.call(
        page: refresh ? 1 : state.currentPage,
        limit: 20,
      );

      if (refresh) {
        state = state.copyWith(
          status: MyVendorProfilesStatus.success,
          vendors: vendors,
          currentPage: 1,
          hasMore: vendors.length >= 20,
          errorMessage: '',
        );
      } else {
        state = state.copyWith(
          status: MyVendorProfilesStatus.success,
          vendors: [...state.vendors, ...vendors],
          currentPage: state.currentPage + 1,
          hasMore: vendors.length >= 20,
          errorMessage: '',
        );
      }
    } catch (e) {
      state = state.copyWith(
        status: MyVendorProfilesStatus.failure,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> loadMoreVendors() async {
    if (!state.hasMore || state.status == MyVendorProfilesStatus.loading) {
      return;
    }

    await loadVendors(refresh: false);
  }

  Future<void> deleteVendor(int vendorId) async {
    // Mark the vendor as being deleted
    state = state.copyWith(
      status: MyVendorProfilesStatus.deleting,
      deletingVendorId: vendorId,
    );

    try {
      await deleteVendorUseCase.call(vendorId);

      // Remove the vendor from the list
      final updatedVendors = state.vendors
          .where((vendor) => vendor.id != vendorId)
          .toList();

      state = state.copyWith(
        status: MyVendorProfilesStatus.success,
        vendors: updatedVendors,
        deletingVendorId: null,
        errorMessage: '',
      );
    } catch (e) {
      state = state.copyWith(
        status: MyVendorProfilesStatus.failure,
        errorMessage: e.toString(),
        deletingVendorId: null,
      );
    }
  }

  void addVendor(VendorEntity vendor) {
    state = state.copyWith(
      vendors: [vendor, ...state.vendors],
    );
  }

  void clearError() {
    state = state.copyWith(
      errorMessage: '',
      status: MyVendorProfilesStatus.success,
    );
  }
}