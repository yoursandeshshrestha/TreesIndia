class RegisterResponseEntity {
  final bool success;
  final String message;
  final dynamic data;
  final String timestamp;

  const RegisterResponseEntity({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  RegisterResponseEntity copyWith({
    bool? success,
    String? message,
    dynamic data,
    String? timestamp,
  }) {
    return RegisterResponseEntity(
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
    return 'RegisterResponseEntity(success: $success, message: $message, data: $data, timestamp: $timestamp)';
  }
}
