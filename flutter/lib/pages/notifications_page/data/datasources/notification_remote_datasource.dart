import 'package:dio/dio.dart';
import '../../../../commons/constants/api_endpoints.dart';
import '../../../../commons/utils/error_handler.dart';
import '../../../../commons/utils/services/dio_client.dart';
import '../models/notification_response_model.dart';
import '../models/unread_count_model.dart';
import '../models/mark_all_read_model.dart';

abstract class NotificationRemoteDataSource {
  Future<NotificationResponseModel> getNotifications({
    int? limit,
    int? page,
    String? type,
    bool? isRead,
  });

  Future<UnreadCountModel> getUnreadCount();

  Future<MarkAllReadModel> markAllAsRead();
}

class NotificationRemoteDataSourceImpl implements NotificationRemoteDataSource {
  final DioClient dioClient;
  final ErrorHandler errorHandler;

  NotificationRemoteDataSourceImpl({
    required this.dioClient,
    required this.errorHandler,
  });

  @override
  Future<NotificationResponseModel> getNotifications({
    int? limit,
    int? page,
    String? type,
    bool? isRead,
  }) async {
    try {
      final url = ApiEndpoints.notifications.path;

      final queryParameters = <String, dynamic>{};
      if (limit != null) queryParameters['limit'] = limit;
      if (page != null) queryParameters['page'] = page;
      if (type != null) queryParameters['type'] = type;
      if (isRead != null) queryParameters['is_read'] = isRead;

      final response = await dioClient.dio.get(
        url,
        queryParameters: queryParameters,
      );

      if (response.statusCode == 200 && response.data != null) {
        return NotificationResponseModel.fromJson(response.data);
      } else {
        throw Exception('Failed to get notifications: ${response.statusMessage}');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting notifications: ${e.toString()}');
    }
  }

  @override
  Future<UnreadCountModel> getUnreadCount() async {
    try {
      final url = ApiEndpoints.unreadCount.path;

      final response = await dioClient.dio.get(url);

      if (response.statusCode == 200 && response.data != null) {
        return UnreadCountModel.fromJson(response.data);
      } else {
        throw Exception('Failed to get unread count: ${response.statusMessage}');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error getting unread count: ${e.toString()}');
    }
  }

  @override
  Future<MarkAllReadModel> markAllAsRead() async {
    try {
      final url = ApiEndpoints.markAllNotificationsAsRead.path;

      final response = await dioClient.dio.patch(url);

      if (response.statusCode == 200 && response.data != null) {
        return MarkAllReadModel.fromJson(response.data);
      } else {
        throw Exception('Failed to mark all as read: ${response.statusMessage}');
      }
    } catch (e) {
      if (e is DioException) {
        errorHandler.handleNetworkError(e);
      } else {
        errorHandler.handleGenericError(e);
      }
      throw Exception('Error marking all as read: ${e.toString()}');
    }
  }
}