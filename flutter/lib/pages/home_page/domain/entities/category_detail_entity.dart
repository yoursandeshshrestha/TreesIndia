import 'package:equatable/equatable.dart';
import 'category_entity.dart';
import 'subcategory_entity.dart';

class CategoryDetailEntity extends Equatable {
  final CategoryEntity category;
  final List<SubcategoryEntity> subcategories;

  const CategoryDetailEntity({
    required this.category,
    required this.subcategories,
  });

  @override
  List<Object> get props => [category, subcategories];
}
