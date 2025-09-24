import 'package:dio/dio.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';
import 'package:trees_india/commons/utils/error_handler.dart';
import 'package:trees_india/commons/utils/services/dio_client.dart';
import '../models/worker_response_model.dart';
import '../models/worker_model.dart';
import '../../domain/entities/worker_filters_entity.dart';

abstract class WorkerRemoteDatasource {
  Future<WorkerResponseModel> getWorkers(WorkerFiltersEntity filters);
  Future<WorkerModel> getWorkerDetails(String workerId);
}

class WorkerRemoteDatasourceImpl implements WorkerRemoteDatasource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  WorkerRemoteDatasourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<WorkerResponseModel> getWorkers(WorkerFiltersEntity filters) async {
    final url = ApiEndpoints.getWorkers.path;

    try {
      final queryParams = filters.toQueryParams();

      final response = await dioClient.dio.get(
        url,
        queryParameters: queryParams,
      );

      if (response.statusCode == 200) {
        return WorkerResponseModel.fromJson(response.data);
      } else {
        throw Exception('Failed to load workers: ${response.statusCode}');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting workers: $e');
    }
  }

  @override
  Future<WorkerModel> getWorkerDetails(String workerId) async {
    final url = ApiEndpoints.getWorkerDetails.path.replaceAll('{workerId}', workerId);

    try {
      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200) {
        final responseData = response.data;
        if (responseData['success'] == true && responseData['data'] != null) {
          final workerData = responseData['data']['worker'];
          return WorkerModel.fromJson(workerData);
        } else {
          throw Exception('Failed to load worker details: ${responseData['message'] ?? 'Unknown error'}');
        }
      } else {
        throw Exception('Failed to load worker details: ${response.statusCode}');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting worker details: $e');
    }
  }
}