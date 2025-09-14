import 'package:equatable/equatable.dart';
import '../../../home_page/data/models/category_model.dart';

class SubcategoryModel extends Equatable {
  final int id;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String name;
  final String slug;
  final String description;
  final String icon;
  final int parentId;
  final CategoryModel parent;
  final bool isActive;

  const SubcategoryModel({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.name,
    required this.slug,
    required this.description,
    required this.icon,
    required this.parentId,
    required this.parent,
    required this.isActive,
  });

  factory SubcategoryModel.fromJson(Map<String, dynamic> json) {
    return SubcategoryModel(
      id: json['id'] as int? ?? 0,
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ??
          DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] as String? ?? '') ??
          DateTime.now(),
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      description: json['description'] as String? ?? '',
      icon: json['icon'] as String? ?? '',
      parentId: json['parent_id'] as int? ?? 0,
      parent:
          CategoryModel.fromJson(json['parent'] as Map<String, dynamic>? ?? {}),
      isActive: json['is_active'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'name': name,
      'slug': slug,
      'description': description,
      'icon': icon,
      'parent_id': parentId,
      'parent': parent.toJson(),
      'is_active': isActive,
    };
  }

  @override
  List<Object?> get props => [
        id,
        createdAt,
        updatedAt,
        name,
        slug,
        description,
        icon,
        parentId,
        parent,
        isActive,
      ];
}
