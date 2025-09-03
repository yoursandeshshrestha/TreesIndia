import '../../domain/entities/profile_update_entity.dart';

class ProfileUpdateRequestModel {
  final String name;
  final String email;
  final String gender;

  ProfileUpdateRequestModel({
    required this.name,
    required this.email,
    required this.gender,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'gender': gender,
    };
  }

  ProfileUpdateRequestEntity toEntity() {
    return ProfileUpdateRequestEntity(
      name: name,
      email: email,
      gender: gender,
    );
  }

  @override
  String toString() {
    return 'ProfileUpdateRequestModel(name: $name, email: $email, gender: $gender)';
  }
}

class ProfileUpdateResponseModel {
  final bool success;
  final String message;
  final ProfileUpdateDataModel? data;
  final String timestamp;

  ProfileUpdateResponseModel({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  factory ProfileUpdateResponseModel.fromJson(Map<String, dynamic> json) {
    ProfileUpdateDataModel? dataModel;
    if (json['data'] != null) {
      dataModel = ProfileUpdateDataModel.fromJson(json['data']);
    }

    return ProfileUpdateResponseModel(
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

  ProfileUpdateResponseEntity toEntity() {
    return ProfileUpdateResponseEntity(
      success: success,
      message: message,
      data: data?.toEntity(),
      timestamp: timestamp,
    );
  }

  @override
  String toString() {
    return 'ProfileUpdateResponseModel(success: $success, message: $message, data: $data)';
  }
}

class ProfileUpdateDataModel {
  final String email;
  final String gender;
  final String name;

  ProfileUpdateDataModel({
    required this.email,
    required this.gender,
    required this.name,
  });

  factory ProfileUpdateDataModel.fromJson(Map<String, dynamic> json) {
    return ProfileUpdateDataModel(
      email: json['email'] ?? '',
      gender: json['gender'] ?? '',
      name: json['name'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'gender': gender,
      'name': name,
    };
  }

  ProfileUpdateDataEntity toEntity() {
    return ProfileUpdateDataEntity(
      email: email,
      gender: gender,
      name: name,
    );
  }

  @override
  String toString() {
    return 'ProfileUpdateDataModel(email: $email, gender: $gender, name: $name)';
  }
}
