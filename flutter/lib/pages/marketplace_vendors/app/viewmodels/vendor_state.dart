import '../../../profile_page/app/views/menu_pages/my_vendor_profiles/domain/entities/vendor_entity.dart';
import '../../domain/entities/vendor_filters_entity.dart';

enum VendorStatus {
  initial,
  loading,
  success,
  failure,
  loadingMore,
}

class VendorState {
  final VendorStatus status;
  final List<VendorEntity> vendors;
  final VendorFiltersEntity filters;
  final String? errorMessage;
  final bool hasReachedMax;

  const VendorState({
    this.status = VendorStatus.initial,
    this.vendors = const [],
    this.filters = const VendorFiltersEntity(),
    this.errorMessage,
    this.hasReachedMax = false,
  });

  VendorState copyWith({
    VendorStatus? status,
    List<VendorEntity>? vendors,
    VendorFiltersEntity? filters,
    String? errorMessage,
    bool? hasReachedMax,
    bool clearError = false,
  }) {
    return VendorState(
      status: status ?? this.status,
      vendors: vendors ?? this.vendors,
      filters: filters ?? this.filters,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
    );
  }

  @override
  String toString() {
    return 'VendorState(status: $status, vendorsCount: ${vendors.length}, filters: $filters, hasReachedMax: $hasReachedMax)';
  }
}