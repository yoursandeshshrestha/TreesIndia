import '../entities/category_entity.dart';
import '../entities/category_detail_entity.dart';

abstract class CategoryRepository {
  Future<List<CategoryEntity>> getCategories();
  Future<CategoryDetailEntity> getCategoryById(int categoryId);
}