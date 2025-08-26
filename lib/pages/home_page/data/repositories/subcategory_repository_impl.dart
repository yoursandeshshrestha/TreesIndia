import '../../domain/entities/subcategory_entity.dart';
import '../../domain/repositories/subcategory_repository.dart';
import '../datasources/subcategory_remote_datasource.dart';

class SubcategoryRepositoryImpl implements SubcategoryRepository {
  final SubcategoryRemoteDataSource remoteDataSource;

  const SubcategoryRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<SubcategoryEntity>> getSubcategoriesByCategory(int categoryId) async {
    final subcategoryModels = await remoteDataSource.getSubcategoriesByCategory(categoryId);
    return subcategoryModels.map((model) => model.toEntity()).toList();
  }
}