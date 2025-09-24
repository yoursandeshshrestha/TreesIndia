import 'worker_model.dart';

class WorkerResponseModel {
  final bool success;
  final String message;
  final List<WorkerModel> data;
  final WorkerPaginationModel pagination;
  final String timestamp;

  WorkerResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.pagination,
    required this.timestamp,
  });

  factory WorkerResponseModel.fromJson(Map<String, dynamic> json) {
    final dataObject = json['data'] as Map<String, dynamic>? ?? {};

    return WorkerResponseModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: dataObject['workers'] != null
          ? (dataObject['workers'] as List)
              .map((w) => WorkerModel.fromJson(w))
              .toList()
          : [],
      pagination: dataObject['pagination'] != null
          ? WorkerPaginationModel.fromJson(dataObject['pagination'])
          : const WorkerPaginationModel(
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
        'workers': data.map((w) => w.toJson()).toList(),
        'pagination': pagination.toJson(),
      },
      'timestamp': timestamp,
    };
  }
}

class WorkerPaginationModel {
  final int currentPage;
  final int totalPages;
  final int totalItems;
  final int itemsPerPage;
  final bool hasNextPage;
  final bool hasPreviousPage;

  const WorkerPaginationModel({
    required this.currentPage,
    required this.totalPages,
    required this.totalItems,
    required this.itemsPerPage,
    required this.hasNextPage,
    required this.hasPreviousPage,
  });

  factory WorkerPaginationModel.fromJson(Map<String, dynamic> json) {
    return WorkerPaginationModel(
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
    return 'WorkerPaginationModel(currentPage: $currentPage, totalPages: $totalPages, totalItems: $totalItems)';
  }
}