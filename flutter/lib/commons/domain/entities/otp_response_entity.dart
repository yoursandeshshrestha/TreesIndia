class OtpResponseDataEntity {
  final String accessToken;
  final int expiresIn;
  final String refreshToken;

  const OtpResponseDataEntity({
    required this.accessToken,
    required this.expiresIn,
    required this.refreshToken,
  });

  OtpResponseDataEntity copyWith({
    String? accessToken,
    int? expiresIn,
    String? refreshToken,
  }) {
    return OtpResponseDataEntity(
      accessToken: accessToken ?? this.accessToken,
      expiresIn: expiresIn ?? this.expiresIn,
      refreshToken: refreshToken ?? this.refreshToken,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'access_token': accessToken,
      'expires_in': expiresIn,
      'refresh_token': refreshToken,
    };
  }

  @override
  String toString() {
    return 'OtpResponseDataEntity(accessToken: $accessToken, expiresIn: $expiresIn, refreshToken: $refreshToken)';
  }
}

class OtpResponseEntity {
  final bool success;
  final String message;
  final OtpResponseDataEntity? data;
  final String timestamp;

  const OtpResponseEntity({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  OtpResponseEntity copyWith({
    bool? success,
    String? message,
    OtpResponseDataEntity? data,
    String? timestamp,
  }) {
    return OtpResponseEntity(
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
      'data': data?.toJson(),
      'timestamp': timestamp,
    };
  }

  @override
  String toString() {
    return 'OtpResponseEntity(success: $success, message: $message, data: $data, timestamp: $timestamp)';
  }
}
