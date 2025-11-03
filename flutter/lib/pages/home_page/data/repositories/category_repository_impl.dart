import '../../domain/entities/category_entity.dart';
import '../../domain/entities/category_detail_entity.dart';
import '../../domain/repositories/category_repository.dart';
import '../datasources/category_remote_datasource.dart';

class CategoryRepositoryImpl implements CategoryRepository {
  final CategoryRemoteDataSource remoteDataSource;

  const CategoryRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<CategoryEntity>> getCategories() async {
    final categoryModels = await remoteDataSource.getCategories();
    return categoryModels.map((model) => model.toEntity()).toList();
  }

  @override
  Future<CategoryDetailEntity> getCategoryById(int categoryId) async {
    final categoryDetailModel = await remoteDataSource.getCategoryById(categoryId);
    return CategoryDetailEntity(
      category: categoryDetailModel.toEntity(),
      subcategories: categoryDetailModel.subcategories.map((model) => model.toEntity()).toList(),
    );
  }
}