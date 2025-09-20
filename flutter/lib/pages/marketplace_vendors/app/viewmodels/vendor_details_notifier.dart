import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/get_vendor_details_usecase.dart';
import 'vendor_details_state.dart';

class VendorDetailsNotifier extends StateNotifier<VendorDetailsState> {
  final GetVendorDetailsUsecase getVendorDetailsUsecase;

  VendorDetailsNotifier({
    required this.getVendorDetailsUsecase,
  }) : super(const VendorDetailsState());

  Future<void> getVendorDetails(String vendorId) async {
    if (vendorId.isEmpty) {
      state = state.copyWith(
        status: VendorDetailsStatus.failure,
        errorMessage: 'Vendor ID is required',
      );
      return;
    }

    // Reset state to clear previous vendor data before loading new data
    state = const VendorDetailsState(status: VendorDetailsStatus.loading);

    try {
      final vendor = await getVendorDetailsUsecase.call(vendorId);
      state = state.copyWith(
        status: VendorDetailsStatus.success,
        vendor: vendor,
        clearError: true,
      );
    } catch (e) {
      state = state.copyWith(
        status: VendorDetailsStatus.failure,
        errorMessage: e.toString(),
      );
    }
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }

  void reset() {
    state = const VendorDetailsState();
  }
}