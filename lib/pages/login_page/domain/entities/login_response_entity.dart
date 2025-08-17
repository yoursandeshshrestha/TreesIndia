class LoginResponseEntity {
  final bool success;
  final String message;
  final dynamic data;
  final String timestamp;

  const LoginResponseEntity({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  LoginResponseEntity copyWith({
    bool? success,
    String? message,
    dynamic data,
    String? timestamp,
  }) {
    return LoginResponseEntity(
      success: success ?? this.success,
      message: message ?? this.message,
      data: data ?? this.data,
      timestamp: timestamp ?? this.timestamp,
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

  @override
  String toString() {
    return 'LoginResponseEntity(success: $success, message: $message, data: $data, timestamp: $timestamp)';
  }
}
