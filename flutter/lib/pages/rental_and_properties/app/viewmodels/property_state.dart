import '../../../profile_page/app/views/menu_pages/my_properties/domain/entities/property_entity.dart';
import '../../domain/entities/property_filters_entity.dart';

enum PropertyStatus { initial, loading, success, failure }

class PropertyState {
  final PropertyStatus status;
  final List<PropertyEntity> properties;
  final PropertyFiltersEntity filters;
  final int total;
  final int page;
  final int limit;
  final int totalPages;
  final bool hasNext;
  final bool hasPrev;
  final String? errorMessage;

  const PropertyState({
    this.status = PropertyStatus.initial,
    this.properties = const [],
    this.filters = const PropertyFiltersEntity(),
    this.total = 0,
    this.page = 1,
    this.limit = 12,
    this.totalPages = 0,
    this.hasNext = false,
    this.hasPrev = false,
    this.errorMessage,
  });

  PropertyState copyWith({
    PropertyStatus? status,
    List<PropertyEntity>? properties,
    PropertyFiltersEntity? filters,
    int? total,
    int? page,
    int? limit,
    int? totalPages,
    bool? hasNext,
    bool? hasPrev,
    String? errorMessage,
  }) {
    return PropertyState(
      status: status ?? this.status,
      properties: properties ?? this.properties,
      filters: filters ?? this.filters,
      total: total ?? this.total,
      page: page ?? this.page,
      limit: limit ?? this.limit,
      totalPages: totalPages ?? this.totalPages,
      hasNext: hasNext ?? this.hasNext,
      hasPrev: hasPrev ?? this.hasPrev,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  bool get isLoading => status == PropertyStatus.loading;
  bool get isSuccess => status == PropertyStatus.success;
  bool get isFailure => status == PropertyStatus.failure;
  bool get isEmpty => properties.isEmpty && status == PropertyStatus.success;

  @override
  String toString() {
    return 'PropertyState(status: $status, properties: ${properties.length}, total: $total, page: $page)';
  }
}