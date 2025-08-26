import 'package:equatable/equatable.dart';
import 'category_entity.dart';

class SubcategoryEntity extends Equatable {
  final int id;
  final String name;
  final String slug;
  final String description;
  final String image;
  final int parentId;
  final CategoryEntity parent;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  const SubcategoryEntity({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.image,
    required this.parentId,
    required this.parent,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  @override
  List<Object> get props => [
        id,
        name,
        slug,
        description,
        image,
        parentId,
        parent,
        isActive,
        createdAt,
        updatedAt,
      ];
}