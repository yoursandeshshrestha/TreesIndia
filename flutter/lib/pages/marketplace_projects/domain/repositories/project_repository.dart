import '../entities/project_entity.dart';
import '../entities/project_filters_entity.dart';

abstract class ProjectRepository {
  Future<List<ProjectEntity>> getProjects(ProjectFiltersEntity filters);
  Future<ProjectEntity> getProjectDetails(String projectId);
}