import '../../domain/entities/register_response_entity.dart';

class RegisterResponseModel {
  final bool success;
  final String message;
  final dynamic data;
  final String timestamp;

  RegisterResponseModel({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  factory RegisterResponseModel.fromJson(Map<String, dynamic> json) {
    return RegisterResponseModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'],
      timestamp: json['timestamp'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data,
      'timestamp': timestamp,
    };
  }

  RegisterResponseEntity toEntity() {
    return RegisterResponseEntity(
      success: success,
      message: message,
      data: data,
      timestamp: timestamp,
    );
  }

  @override
  String toString() {
    return 'RegisterResponseModel(success: $success, message: $message, data: $data, timestamp: $timestamp)';
  }
}
