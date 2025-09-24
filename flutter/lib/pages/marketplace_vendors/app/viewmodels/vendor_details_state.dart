import '../../../profile_page/app/views/menu_pages/my_vendor_profiles/domain/entities/vendor_entity.dart';

enum VendorDetailsStatus {
  initial,
  loading,
  success,
  failure,
}

class VendorDetailsState {
  final VendorDetailsStatus status;
  final VendorEntity? vendor;
  final String? errorMessage;

  const VendorDetailsState({
    this.status = VendorDetailsStatus.initial,
    this.vendor,
    this.errorMessage,
  });

  VendorDetailsState copyWith({
    VendorDetailsStatus? status,
    VendorEntity? vendor,
    String? errorMessage,
    bool clearError = false,
  }) {
    return VendorDetailsState(
      status: status ?? this.status,
      vendor: vendor ?? this.vendor,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }

  @override
  String toString() {
    return 'VendorDetailsState(status: $status, vendor: ${vendor?.vendorName}, errorMessage: $errorMessage)';
  }
}