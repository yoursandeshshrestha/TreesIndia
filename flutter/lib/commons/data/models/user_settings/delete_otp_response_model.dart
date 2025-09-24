import 'package:trees_india/commons/domain/entities/user_settings/delete_otp_response_entity.dart';

class DeleteOtpResponseModel {
  final String message;
  final String phone;

  DeleteOtpResponseModel({
    required this.message,
    required this.phone,
  });

  factory DeleteOtpResponseModel.fromJson(Map<String, dynamic> json) {
    return DeleteOtpResponseModel(
      message: json['message'] ?? '',
      phone: json['phone'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'message': message,
      'phone': phone,
    };
  }

  DeleteOtpResponseEntity toEntity() {
    return DeleteOtpResponseEntity(
      message: message,
      phone: phone,
    );
  }

  factory DeleteOtpResponseModel.fromEntity(DeleteOtpResponseEntity entity) {
    return DeleteOtpResponseModel(
      message: entity.message,
      phone: entity.phone,
    );
  }
}
