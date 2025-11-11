import 'package:dio/dio.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';
import 'package:trees_india/commons/utils/error_handler.dart';
import 'package:trees_india/commons/utils/services/dio_client.dart';
import 'package:trees_india/pages/marketplace_projects/data/models/project_response_model.dart';

import '../../domain/entities/project_filters_entity.dart';
import '../models/project_model.dart';

abstract class ProjectRemoteDatasource {
  Future<ProjectResponseModel> getProjects(ProjectFiltersEntity filters);
  Future<ProjectModel> getProjectDetails(String projectId);
}

class ProjectRemoteDatasourceImpl implements ProjectRemoteDatasource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  ProjectRemoteDatasourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<ProjectResponseModel> getProjects(ProjectFiltersEntity filters) async {
    final url = ApiEndpoints.getProjects.path;

    try {
      final queryParams = filters.toQueryParams();

      final response = await dioClient.dio.get(
        url,
        queryParameters: queryParams,
      );

      if (response.statusCode == 200) {
        return ProjectResponseModel.fromJson(response.data);
      } else {
        throw Exception('Failed to load projects: ${response.statusCode}');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting projects: $e');
    }
  }

  @override
  Future<ProjectModel> getProjectDetails(String projectId) async {
    final url = ApiEndpoints.getProjectDetails.path.replaceAll('{projectId}', projectId);

    try {
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200) {
        final responseData = response.data;
        if (responseData['success'] == true && responseData['data'] != null) {
          return ProjectModel.fromJson(responseData['data']);
        } else {
          throw Exception('Failed to load project details: ${responseData['message'] ?? 'Unknown error'}');
        }
      } else {
        throw Exception('Failed to load project details: ${response.statusCode}');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting project details: $e');
    }
  }
}