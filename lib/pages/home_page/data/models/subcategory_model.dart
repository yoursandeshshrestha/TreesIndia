import '../../domain/entities/subcategory_entity.dart';
import 'category_model.dart';

class SubcategoryModel extends SubcategoryEntity {
  const SubcategoryModel({
    required super.id,
    required super.name,
    required super.slug,
    required super.description,
    required super.icon,
    required super.parentId,
    required super.parent,
    required super.isActive,
    required super.createdAt,
    required super.updatedAt,
  });

  factory SubcategoryModel.fromJson(Map<String, dynamic> json) {
    return SubcategoryModel(
      id: json['id'] as int,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String,
      icon: json['icon'] as String,
      parentId: json['parent_id'] as int,
      parent: CategoryModel.fromJson(json['parent'] as Map<String, dynamic>),
      isActive: json['is_active'] as bool,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'icon': icon,
      'parent_id': parentId,
      'parent': (parent as CategoryModel).toJson(),
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  SubcategoryEntity toEntity() {
    return SubcategoryEntity(
      id: id,
      name: name,
      slug: slug,
      description: description,
      icon: icon,
      parentId: parentId,
      parent: parent,
      isActive: isActive,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory SubcategoryModel.fromEntity(SubcategoryEntity entity) {
    return SubcategoryModel(
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      icon: entity.icon,
      parentId: entity.parentId,
      parent: entity.parent,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }
}
