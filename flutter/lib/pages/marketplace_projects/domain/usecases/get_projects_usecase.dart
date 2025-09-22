import '../entities/project_entity.dart';
import '../entities/project_filters_entity.dart';
import '../repositories/project_repository.dart';

class GetProjectsUsecase {
  final ProjectRepository repository;

  GetProjectsUsecase(this.repository);

  Future<List<ProjectEntity>> call(ProjectFiltersEntity filters) async {
    try {
      return await repository.getProjects(filters);
    } catch (e) {
      throw Exception('Failed to get projects: $e');
    }
  }
}