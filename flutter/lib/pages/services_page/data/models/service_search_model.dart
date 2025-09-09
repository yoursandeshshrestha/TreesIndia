import 'package:equatable/equatable.dart';
import '../../../home_page/data/models/category_model.dart';
import 'subcategory_model.dart';
import 'service_area_model.dart';

class ServiceSearchModel extends Equatable {
  final int id;
  final String name;
  final String slug;
  final String description;
  final List<String>? images;
  final String priceType;
  final int? price;
  final String? duration;
  final int categoryId;
  final int subcategoryId;
  final CategoryModel? category;
  final SubcategoryModel? subcategory;
  final String? categoryName;
  final String? subcategoryName;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;
  final List<ServiceAreaModel>? serviceAreas;

  const ServiceSearchModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    this.images,
    required this.priceType,
    this.price,
    this.duration,
    required this.categoryId,
    required this.subcategoryId,
    this.category,
    this.subcategory,
    this.categoryName,
    this.subcategoryName,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    this.serviceAreas,
  });

  factory ServiceSearchModel.fromJson(Map<String, dynamic> json) {
    return ServiceSearchModel(
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
      category: json['category'] != null
          ? CategoryModel.fromJson(json['category'] as Map<String, dynamic>)
          : null,
      subcategory: json['subcategory'] != null
          ? SubcategoryModel.fromJson(
              json['subcategory'] as Map<String, dynamic>)
          : null,
      categoryName: json['category_name'] as String?,
      subcategoryName: json['subcategory_name'] as String?,
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
          null,
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
      'category': category?.toJson(),
      'subcategory': subcategory?.toJson(),
      'category_name': categoryName,
      'subcategory_name': subcategoryName,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'deleted_at': deletedAt?.toIso8601String(),
      'service_areas': serviceAreas?.map((area) => area.toJson()).toList(),
    };
  }

  // Helper method to get category name from either nested object or string
  String get effectiveCategoryName {
    return categoryName ?? category?.name ?? '';
  }

  // Helper method to get subcategory name from either nested object or string
  String get effectiveSubcategoryName {
    return subcategoryName ?? subcategory?.name ?? '';
  }

  @override
  List<Object?> get props => [
        id,
        name,
        slug,
        description,
        images,
        priceType,
        price,
        duration,
        categoryId,
        subcategoryId,
        category,
        subcategory,
        categoryName,
        subcategoryName,
        isActive,
        createdAt,
        updatedAt,
        deletedAt,
        serviceAreas,
      ];
}
