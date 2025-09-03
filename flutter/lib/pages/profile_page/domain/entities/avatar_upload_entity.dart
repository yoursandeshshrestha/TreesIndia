import 'dart:typed_data';

class AvatarUploadRequestEntity {
  final Uint8List fileData;
  final String fileName;

  const AvatarUploadRequestEntity({
    required this.fileData,
    required this.fileName,
  });

  AvatarUploadRequestEntity copyWith({
    Uint8List? fileData,
    String? fileName,
  }) {
    return AvatarUploadRequestEntity(
      fileData: fileData ?? this.fileData,
      fileName: fileName ?? this.fileName,
    );
  }

  @override
  String toString() {
    return 'AvatarUploadRequestEntity(fileName: $fileName, fileDataLength: ${fileData.length})';
  }
}

class AvatarUploadResponseEntity {
  final bool success;
  final String message;
  final AvatarUploadDataEntity? data;
  final String timestamp;

  const AvatarUploadResponseEntity({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  AvatarUploadResponseEntity copyWith({
    bool? success,
    String? message,
    AvatarUploadDataEntity? data,
    String? timestamp,
  }) {
    return AvatarUploadResponseEntity(
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
    return 'AvatarUploadResponseEntity(success: $success, message: $message, data: $data)';
  }
}

class AvatarUploadDataEntity {
  final String avatarUrl;

  const AvatarUploadDataEntity({
    required this.avatarUrl,
  });

  AvatarUploadDataEntity copyWith({
    String? avatarUrl,
  }) {
    return AvatarUploadDataEntity(
      avatarUrl: avatarUrl ?? this.avatarUrl,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'avatar_url': avatarUrl,
    };
  }

  @override
  String toString() {
    return 'AvatarUploadDataEntity(avatarUrl: $avatarUrl)';
  }
}
