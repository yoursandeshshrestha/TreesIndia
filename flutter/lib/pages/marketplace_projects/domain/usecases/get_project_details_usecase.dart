import '../entities/project_entity.dart';
import '../repositories/project_repository.dart';

class GetProjectDetailsUsecase {
  final ProjectRepository repository;

  GetProjectDetailsUsecase(this.repository);

  Future<ProjectEntity> call(String projectId) async {
    try {
      return await repository.getProjectDetails(projectId);
    } catch (e) {
      throw Exception('Failed to get project details: $e');
    }
  }
}