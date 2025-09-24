import '../../domain/entities/project_entity.dart';
import '../../domain/entities/project_filters_entity.dart';
import '../../domain/repositories/project_repository.dart';
import '../datasources/project_remote_datasource.dart';

class ProjectRepositoryImpl implements ProjectRepository {
  final ProjectRemoteDatasource remoteDatasource;

  ProjectRepositoryImpl({
    required this.remoteDatasource,
  });

  @override
  Future<List<ProjectEntity>> getProjects(ProjectFiltersEntity filters) async {
    try {
      final projectResponse = await remoteDatasource.getProjects(filters);
      return projectResponse.data.map((projectModel) => projectModel.toEntity()).toList();
    } catch (e) {
      throw Exception('Failed to get projects from repository: $e');
    }
  }

  @override
  Future<ProjectEntity> getProjectDetails(String projectId) async {
    try {
      final projectModel = await remoteDatasource.getProjectDetails(projectId);
      return projectModel.toEntity();
    } catch (e) {
      throw Exception('Failed to get project details from repository: $e');
    }
  }
}