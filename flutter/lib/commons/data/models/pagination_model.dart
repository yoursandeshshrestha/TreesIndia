import '../../domain/entities/pagination_entity.dart';

class PaginationModel extends PaginationEntity {
  const PaginationModel({
    required super.hasNext,
    required super.hasPrev,
    required super.limit,
    required super.page,
    required super.total,
    required super.totalPages,
  });

  factory PaginationModel.fromJson(Map<String, dynamic> json) {
    return PaginationModel(
      hasNext: json['has_next'] as bool,
      hasPrev: json['has_prev'] as bool,
      limit: json['limit'] as int,
      page: json['page'] as int,
      total: json['total'] as int,
      totalPages: json['total_pages'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'has_next': hasNext,
      'has_prev': hasPrev,
      'limit': limit,
      'page': page,
      'total': total,
      'total_pages': totalPages,
    };
  }

  PaginationEntity toEntity() {
    return PaginationEntity(
      hasNext: hasNext,
      hasPrev: hasPrev,
      limit: limit,
      page: page,
      total: total,
      totalPages: totalPages,
    );
  }

  factory PaginationModel.fromEntity(PaginationEntity entity) {
    return PaginationModel(
      hasNext: entity.hasNext,
      hasPrev: entity.hasPrev,
      limit: entity.limit,
      page: entity.page,
      total: entity.total,
      totalPages: entity.totalPages,
    );
  }
}