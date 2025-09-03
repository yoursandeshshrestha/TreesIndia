import 'dart:typed_data';
import '../../domain/entities/avatar_upload_entity.dart';

class AvatarUploadRequestModel {
  final Uint8List fileData;
  final String fileName;

  AvatarUploadRequestModel({
    required this.fileData,
    required this.fileName,
  });

  AvatarUploadRequestEntity toEntity() {
    return AvatarUploadRequestEntity(
      fileData: fileData,
      fileName: fileName,
    );
  }

  @override
  String toString() {
    return 'AvatarUploadRequestModel(fileName: $fileName, fileDataLength: ${fileData.length})';
  }
}

class AvatarUploadResponseModel {
  final bool success;
  final String message;
  final AvatarUploadDataModel? data;
  final String timestamp;

  AvatarUploadResponseModel({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  factory AvatarUploadResponseModel.fromJson(Map<String, dynamic> json) {
    AvatarUploadDataModel? dataModel;
    if (json['data'] != null) {
      dataModel = AvatarUploadDataModel.fromJson(json['data']);
    }

    return AvatarUploadResponseModel(
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

  AvatarUploadResponseEntity toEntity() {
    return AvatarUploadResponseEntity(
      success: success,
      message: message,
      data: data?.toEntity(),
      timestamp: timestamp,
    );
  }

  @override
  String toString() {
    return 'AvatarUploadResponseModel(success: $success, message: $message, data: $data)';
  }
}

class AvatarUploadDataModel {
  final String avatarUrl;

  AvatarUploadDataModel({
    required this.avatarUrl,
  });

  factory AvatarUploadDataModel.fromJson(Map<String, dynamic> json) {
    return AvatarUploadDataModel(
      avatarUrl: json['avatar_url'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'avatar_url': avatarUrl,
    };
  }

  AvatarUploadDataEntity toEntity() {
    return AvatarUploadDataEntity(
      avatarUrl: avatarUrl,
    );
  }

  @override
  String toString() {
    return 'AvatarUploadDataModel(avatarUrl: $avatarUrl)';
  }
}
