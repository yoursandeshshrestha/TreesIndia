import '../../domain/entities/login_response_entity.dart';

class LoginResponseModel {
  final bool success;
  final String message;
  final dynamic data;
  final String timestamp;

  LoginResponseModel({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  factory LoginResponseModel.fromJson(Map<String, dynamic> json) {
    return LoginResponseModel(
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

  LoginResponseEntity toEntity() {
    return LoginResponseEntity(
      success: success,
      message: message,
      data: data,
      timestamp: timestamp,
    );
  }

  @override
  String toString() {
    return 'LoginResponseModel(success: $success, message: $message, data: $data, timestamp: $timestamp)';
  }
}
