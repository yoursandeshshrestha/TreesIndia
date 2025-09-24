import 'package:dio/dio.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';
import 'package:trees_india/commons/data/models/stats_model.dart';
import 'package:trees_india/commons/utils/error_handler.dart';
import 'package:trees_india/commons/utils/services/dio_client.dart';

abstract class StatsRemoteDatasource {
  Future<StatsResponseModel<ProjectStatsModel>> getProjectsStats();
  Future<StatsResponseModel<VendorStatsModel>> getVendorsStats();
  Future<StatsResponseModel<WorkerStatsModel>> getWorkersStats();
}

class StatsRemoteDatasourceImpl implements StatsRemoteDatasource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  StatsRemoteDatasourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<StatsResponseModel<ProjectStatsModel>> getProjectsStats() async {
    final url = ApiEndpoints.projectsStats.path;

    try {
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200) {
        return StatsResponseModel.fromJson(
          response.data,
          (data) => ProjectStatsModel.fromJson(data),
        );
      } else {
        throw Exception('Failed to load project stats');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting project stats: $e');
    }
  }

  @override
  Future<StatsResponseModel<VendorStatsModel>> getVendorsStats() async {
    final url = ApiEndpoints.vendorsStats.path;

    try {
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200) {
        return StatsResponseModel.fromJson(
          response.data,
          (data) => VendorStatsModel.fromJson(data),
        );
      } else {
        throw Exception('Failed to load vendor stats');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting vendor stats: $e');
    }
  }

  @override
  Future<StatsResponseModel<WorkerStatsModel>> getWorkersStats() async {
    final url = ApiEndpoints.workersStats.path;

    try {
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200) {
        return StatsResponseModel.fromJson(
          response.data,
          (data) => WorkerStatsModel.fromJson(data),
        );
      } else {
        throw Exception('Failed to load worker stats');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting worker stats: $e');
    }
  }
}