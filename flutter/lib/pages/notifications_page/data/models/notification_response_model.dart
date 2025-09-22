import 'package:trees_india/commons/data/models/pagination_model.dart';
import '../../domain/entities/notification_response_entity.dart';
import 'notification_model.dart';

class NotificationResponseModel {
  final bool success;
  final String message;
  final List<NotificationModel> data;
  final PaginationModel pagination;

  NotificationResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.pagination,
  });

  factory NotificationResponseModel.fromJson(Map<String, dynamic> json) {
    return NotificationResponseModel(
      success: json['success'] as bool,
      message: json['message'] as String? ?? '',
      data: (json['data'] as List<dynamic>)
          .map((item) =>
              NotificationModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      pagination:
          PaginationModel.fromJson(json['pagination'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data.map((item) => item.toJson()).toList(),
      'pagination': pagination.toJson(),
    };
  }

  NotificationResponseEntity toEntity() {
    return NotificationResponseEntity(
      success: success,
      message: message,
      notifications: data.map((model) => model.toEntity()).toList(),
      pagination: pagination.toEntity(),
    );
  }
}
