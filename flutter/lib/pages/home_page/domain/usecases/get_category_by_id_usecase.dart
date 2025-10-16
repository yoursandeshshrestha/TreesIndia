import '../entities/category_detail_entity.dart';
import '../repositories/category_repository.dart';

class GetCategoryByIdUseCase {
  final CategoryRepository repository;

  GetCategoryByIdUseCase(this.repository);

  Future<CategoryDetailEntity> call(int categoryId) {
    return repository.getCategoryById(categoryId);
  }
}
