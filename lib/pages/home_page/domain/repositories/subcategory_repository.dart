import '../entities/subcategory_entity.dart';

abstract class SubcategoryRepository {
  Future<List<SubcategoryEntity>> getSubcategoriesByCategory(int categoryId);
}