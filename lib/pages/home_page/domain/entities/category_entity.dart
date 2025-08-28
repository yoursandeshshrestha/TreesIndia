import 'package:equatable/equatable.dart';

class CategoryEntity extends Equatable {
  final int id;
  final String name;
  final String slug;
  final String description;
  // final String image;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  const CategoryEntity({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    // required this.image,
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
        // image,
        isActive,
        createdAt,
        updatedAt,
      ];
}