import '../../domain/entities/category_entity.dart';
import 'category_model.dart';
import 'subcategory_model.dart';

class CategoryDetailModel extends CategoryModel {
  final List<SubcategoryModel> subcategories;

  const CategoryDetailModel({
    required super.id,
    required super.name,
    required super.slug,
    required super.description,
    required super.isActive,
    required super.createdAt,
    required super.updatedAt,
    required this.subcategories,
  });

  factory CategoryDetailModel.fromJson(Map<String, dynamic> json) {
    return CategoryDetailModel(
      id: json['id'] as int,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String,
      isActive: json['is_active'] as bool,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      subcategories: (json['subcategories'] as List<dynamic>?)
              ?.map((e) => SubcategoryModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  @override
  Map<String, dynamic> toJson() {
    final json = super.toJson();
    json['subcategories'] = subcategories.map((e) => e.toJson()).toList();
    return json;
  }

  @override
  CategoryEntity toEntity() {
    return CategoryEntity(
      id: id,
      name: name,
      slug: slug,
      description: description,
      isActive: isActive,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
