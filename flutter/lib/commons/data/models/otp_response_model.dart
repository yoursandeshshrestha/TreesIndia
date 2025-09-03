import '../../../commons/domain/entities/otp_response_entity.dart';
import '../../../commons/data/models/token_model.dart';

class OtpResponseDataModel {
  final String accessToken;
  final int expiresIn;
  final String refreshToken;

  OtpResponseDataModel({
    required this.accessToken,
    required this.expiresIn,
    required this.refreshToken,
  });

  factory OtpResponseDataModel.fromJson(Map<String, dynamic> json) {
    return OtpResponseDataModel(
      accessToken: json['access_token'] ?? '',
      expiresIn: json['expires_in'] ?? 0,
      refreshToken: json['refresh_token'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'access_token': accessToken,
      'expires_in': expiresIn,
      'refresh_token': refreshToken,
    };
  }

  OtpResponseDataEntity toEntity() {
    return OtpResponseDataEntity(
      accessToken: accessToken,
      expiresIn: expiresIn,
      refreshToken: refreshToken,
    );
  }

  TokenModel toTokenModel() {
    return TokenModel(
      authToken: accessToken,
      refreshToken: refreshToken,
    );
  }

  @override
  String toString() {
    return 'OtpResponseDataModel(accessToken: $accessToken, expiresIn: $expiresIn, refreshToken: $refreshToken)';
  }
}

class OtpResponseModel {
  final bool success;
  final String message;
  final OtpResponseDataModel? data;
  final String timestamp;

  OtpResponseModel({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  factory OtpResponseModel.fromJson(Map<String, dynamic> json) {
    OtpResponseDataModel? dataModel;
    if (json['data'] != null) {
      dataModel = OtpResponseDataModel.fromJson(json['data']);
    }

    return OtpResponseModel(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: dataModel,
      timestamp: json['timestamp'] ?? '',
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

  OtpResponseEntity toEntity() {
    return OtpResponseEntity(
      success: success,
      message: message,
      data: data?.toEntity(),
      timestamp: timestamp,
    );
  }

  @override
  String toString() {
    return 'OtpResponseModel(success: $success, message: $message, data: $data, timestamp: $timestamp)';
  }
}
