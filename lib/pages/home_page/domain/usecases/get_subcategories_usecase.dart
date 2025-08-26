import '../entities/subcategory_entity.dart';
import '../repositories/subcategory_repository.dart';

class GetSubcategoriesUseCase {
  final SubcategoryRepository repository;

  const GetSubcategoriesUseCase(this.repository);

  Future<List<SubcategoryEntity>> call(int categoryId) async {
    return await repository.getSubcategoriesByCategory(categoryId);
  }
}