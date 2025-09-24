import '../../../profile_page/app/views/menu_pages/my_vendor_profiles/data/models/vendor_model.dart';

class VendorResponseModel {
  final bool success;
  final String message;
  final List<VendorModel> data;
  final VendorPaginationModel pagination;
  final String timestamp;

  VendorResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.pagination,
    required this.timestamp,
  });

  factory VendorResponseModel.fromJson(Map<String, dynamic> json) {
    final dataObject = json['data'] as Map<String, dynamic>? ?? {};

    return VendorResponseModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: dataObject['vendors'] != null
          ? (dataObject['vendors'] as List)
              .map((v) => VendorModel.fromJson(v))
              .toList()
          : [],
      pagination: dataObject['pagination'] != null
          ? VendorPaginationModel.fromJson(dataObject['pagination'])
          : const VendorPaginationModel(
              currentPage: 1,
              totalPages: 1,
              totalItems: 0,
              itemsPerPage: 12,
              hasNextPage: false,
              hasPreviousPage: false,
            ),
      timestamp: json['timestamp'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': {
        'vendors': data.map((v) => v.toJson()).toList(),
        'pagination': pagination.toJson(),
      },
      'timestamp': timestamp,
    };
  }
}

class VendorPaginationModel {
  final int currentPage;
  final int totalPages;
  final int totalItems;
  final int itemsPerPage;
  final bool hasNextPage;
  final bool hasPreviousPage;

  const VendorPaginationModel({
    required this.currentPage,
    required this.totalPages,
    required this.totalItems,
    required this.itemsPerPage,
    required this.hasNextPage,
    required this.hasPreviousPage,
  });

  factory VendorPaginationModel.fromJson(Map<String, dynamic> json) {
    return VendorPaginationModel(
      currentPage: json['page'] ?? 1,
      totalPages: json['total_pages'] ?? 1,
      totalItems: json['total'] ?? 0,
      itemsPerPage: json['limit'] ?? 12,
      hasNextPage: json['has_next'] ?? false,
      hasPreviousPage: json['has_prev'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'page': currentPage,
      'total_pages': totalPages,
      'total': totalItems,
      'limit': itemsPerPage,
      'has_next': hasNextPage,
      'has_prev': hasPreviousPage,
    };
  }

  @override
  String toString() {
    return 'VendorPaginationModel(currentPage: $currentPage, totalPages: $totalPages, totalItems: $totalItems)';
  }
}
