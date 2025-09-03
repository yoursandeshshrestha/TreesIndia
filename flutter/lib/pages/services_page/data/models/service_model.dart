import '../../domain/entities/service_detail_entity.dart';
import 'service_area_model.dart';

class ServiceModel extends ServiceDetailEntity {
  const ServiceModel({
    required super.id,
    required super.name,
    required super.slug,
    required super.description,
    super.images,
    required super.priceType,
    super.price,
    super.duration,
    required super.categoryId,
    required super.subcategoryId,
    required super.categoryName,
    required super.subcategoryName,
    required super.isActive,
    required super.createdAt,
    required super.updatedAt,
    super.deletedAt,
    required super.serviceAreas,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      description: json['description'] as String? ?? '',
      images: (json['images'] != null &&
              (json['images'] as List<dynamic>?)?.isNotEmpty == true)
          ? (json['images'] as List<dynamic>).cast<String>()
          : null,
      priceType: json['price_type'] as String? ?? '',
      price: json['price'] as int?,
      duration: json['duration'] as String?,
      categoryId: json['category_id'] as int? ?? 0,
      subcategoryId: json['subcategory_id'] as int? ?? 0,
      categoryName: json['category_name'] as String? ?? '',
      subcategoryName: json['subcategory_name'] as String? ?? '',
      isActive: json['is_active'] as bool? ?? false,
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ??
          DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] as String? ?? '') ??
          DateTime.now(),
      deletedAt: json['deleted_at'] != null
          ? DateTime.tryParse(json['deleted_at'] as String)
          : null,
      serviceAreas: (json['service_areas'] as List<dynamic>?)
              ?.map((area) =>
                  ServiceAreaModel.fromJson(area as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'images': images,
      'price_type': priceType,
      'price': price,
      'duration': duration,
      'category_id': categoryId,
      'subcategory_id': subcategoryId,
      'category_name': categoryName,
      'subcategory_name': subcategoryName,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'deleted_at': deletedAt?.toIso8601String(),
      'service_areas': serviceAreas
          .map((area) => (area as ServiceAreaModel).toJson())
          .toList(),
    };
  }

  ServiceDetailEntity toEntity() {
    return ServiceDetailEntity(
      id: id,
      name: name,
      slug: slug,
      description: description,
      images: images,
      priceType: priceType,
      price: price,
      duration: duration,
      categoryId: categoryId,
      subcategoryId: subcategoryId,
      categoryName: categoryName,
      subcategoryName: subcategoryName,
      isActive: isActive,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deletedAt: deletedAt,
      serviceAreas: serviceAreas.map((area) => area).toList(),
    );
  }

  factory ServiceModel.fromEntity(ServiceDetailEntity entity) {
    return ServiceModel(
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      images: entity.images,
      priceType: entity.priceType,
      price: entity.price,
      duration: entity.duration,
      categoryId: entity.categoryId,
      subcategoryId: entity.subcategoryId,
      categoryName: entity.categoryName,
      subcategoryName: entity.subcategoryName,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      serviceAreas: entity.serviceAreas,
    );
  }
}
