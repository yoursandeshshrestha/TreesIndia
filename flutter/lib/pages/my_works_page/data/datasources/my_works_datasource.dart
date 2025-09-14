import 'package:dio/dio.dart';
import 'package:trees_india/commons/constants/api_endpoints.dart';
import '../../../../commons/utils/services/dio_client.dart';
import '../../../../commons/utils/error_handler.dart';
import '../models/assignment_response_model.dart';
import '../../app/viewmodels/my_works_state.dart';

class MyWorksDataSource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  MyWorksDataSource({
    required this.dioClient,
    required this.errorHandler,
  });

  Future<AssignmentResponseModel> getAssignments({
    AssignmentTab tab = AssignmentTab.all,
    int page = 1,
    int limit = 10,
  }) async {
    final url = ApiEndpoints.getAssignments.path;

    // Build query parameters
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
    };

    // Add status filter based on tab
    switch (tab) {
      case AssignmentTab.all:
        // No status filter for all assignments
        break;
      case AssignmentTab.assigned:
        queryParams['status'] = 'assigned';
        break;
      case AssignmentTab.accepted:
        queryParams['status'] = 'accepted';
        break;
      case AssignmentTab.inProgress:
        queryParams['status'] = 'in_progress';
        break;
      case AssignmentTab.completed:
        queryParams['status'] = 'completed';
        break;
    }

    try {
      final response = await dioClient.dio.get(
        url,
        queryParameters: queryParams,
      );

      if (response.statusCode == 200 && response.data != null) {
        print('📍 Fetched worker assignments for tab: $tab');
        try {
          return AssignmentResponseModel.fromJson(response.data);
        } catch (parseError) {
          print('📍 Parsing error: $parseError');
          print('📍 Response data: ${response.data}');
          rethrow;
        }
      } else {
        throw Exception('Failed to get assignments. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting assignments.');
    }
  }

  Future<void> acceptAssignment({
    required int assignmentId,
    String notes = 'Assignment accepted via mobile app',
  }) async {
    final url = ApiEndpoints.acceptAssignment.path
        .replaceAll('{assignmentId}', assignmentId.toString());

    final payload = <String, dynamic>{
      'notes': notes,
    };

    try {
      final response = await dioClient.dio.post(url, data: payload);

      if (response.statusCode == 200) {
        print('📍 Assignment accepted successfully: $assignmentId');
      } else {
        throw Exception('Failed to accept assignment. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error accepting assignment.');
    }
  }

  Future<void> rejectAssignment({
    required int assignmentId,
    required String reason,
    String notes = '',
  }) async {
    final url = ApiEndpoints.rejectAssignment.path
        .replaceAll('{assignmentId}', assignmentId.toString());

    final payload = <String, dynamic>{
      'reason': reason,
      'notes': notes,
    };

    try {
      final response = await dioClient.dio.post(url, data: payload);

      if (response.statusCode == 200) {
        print('📍 Assignment rejected successfully: $assignmentId');
      } else {
        throw Exception('Failed to reject assignment. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error rejecting assignment.');
    }
  }

  Future<void> startWork({
    required int assignmentId,
    String notes = 'Work started via mobile app',
  }) async {
    final url = ApiEndpoints.startWork.path
        .replaceAll('{assignmentId}', assignmentId.toString());

    final payload = <String, dynamic>{
      'notes': notes,
    };

    try {
      final response = await dioClient.dio.post(url, data: payload);

      if (response.statusCode == 200) {
        print('📍 Work started successfully: $assignmentId');
      } else {
        throw Exception('Failed to start work. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error starting work.');
    }
  }

  Future<void> completeWork({
    required int assignmentId,
    String notes = 'Work completed via mobile app',
  }) async {
    final url = ApiEndpoints.completeWork.path
        .replaceAll('{assignmentId}', assignmentId.toString());

    final payload = <String, dynamic>{
      'notes': notes,
    };

    try {
      final response = await dioClient.dio.post(url, data: payload);

      if (response.statusCode == 200) {
        print('📍 Work completed successfully: $assignmentId');
      } else {
        throw Exception('Failed to complete work. Please try again.');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error completing work.');
    }
  }
}
