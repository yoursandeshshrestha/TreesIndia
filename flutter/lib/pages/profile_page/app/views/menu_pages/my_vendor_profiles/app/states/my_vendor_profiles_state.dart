import 'package:equatable/equatable.dart';
import '../../domain/entities/vendor_entity.dart';

enum MyVendorProfilesStatus { initial, loading, success, failure, deleting }

class MyVendorProfilesState extends Equatable {
  final MyVendorProfilesStatus status;
  final List<VendorEntity> vendors;
  final String errorMessage;
  final bool hasMore;
  final int currentPage;
  final int? deletingVendorId;

  const MyVendorProfilesState({
    this.status = MyVendorProfilesStatus.initial,
    this.vendors = const [],
    this.errorMessage = '',
    this.hasMore = true,
    this.currentPage = 1,
    this.deletingVendorId,
  });

  MyVendorProfilesState copyWith({
    MyVendorProfilesStatus? status,
    List<VendorEntity>? vendors,
    String? errorMessage,
    bool? hasMore,
    int? currentPage,
    int? deletingVendorId,
  }) {
    return MyVendorProfilesState(
      status: status ?? this.status,
      vendors: vendors ?? this.vendors,
      errorMessage: errorMessage ?? this.errorMessage,
      hasMore: hasMore ?? this.hasMore,
      currentPage: currentPage ?? this.currentPage,
      deletingVendorId: deletingVendorId ?? this.deletingVendorId,
    );
  }

  @override
  List<Object?> get props => [
        status,
        vendors,
        errorMessage,
        hasMore,
        currentPage,
        deletingVendorId,
      ];
}