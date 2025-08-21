import '../../domain/entities/user_profile_entity.dart';

class UserProfileDataModel {
  final String avatar;
  final String createdAt;
  final String email;
  final String gender;
  final int id;
  final bool isActive;
  final bool isVerified;
  final String name;
  final String phone;
  final String updatedAt;
  final String userType;

  UserProfileDataModel({
    required this.avatar,
    required this.createdAt,
    required this.email,
    required this.gender,
    required this.id,
    required this.isActive,
    required this.isVerified,
    required this.name,
    required this.phone,
    required this.updatedAt,
    required this.userType,
  });

  factory UserProfileDataModel.fromJson(Map<String, dynamic> json) {
    return UserProfileDataModel(
      avatar: json['avatar'] ?? '',
      createdAt: json['created_at'] ?? '',
      email: json['email'] ?? '',
      gender: json['gender'] ?? '',
      id: json['id'] ?? 0,
      isActive: json['is_active'] ?? false,
      isVerified: json['is_verified'] ?? false,
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      updatedAt: json['updated_at'] ?? '',
      userType: json['user_type'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'avatar': avatar,
      'created_at': createdAt,
      'email': email,
      'gender': gender,
      'id': id,
      'is_active': isActive,
      'is_verified': isVerified,
      'name': name,
      'phone': phone,
      'updated_at': updatedAt,
      'user_type': userType,
    };
  }

  UserProfileDataEntity toEntity() {
    return UserProfileDataEntity(
      avatar: avatar,
      createdAt: createdAt,
      email: email,
      gender: gender,
      id: id,
      isActive: isActive,
      isVerified: isVerified,
      name: name,
      phone: phone,
      updatedAt: updatedAt,
      userType: userType,
    );
  }

  @override
  String toString() {
    return 'UserProfileDataModel(id: $id, name: $name, email: $email, phone: $phone, isVerified: $isVerified)';
  }
}

class UserProfileResponseModel {
  final bool success;
  final String message;
  final UserProfileDataModel? data;
  final String timestamp;

  UserProfileResponseModel({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  factory UserProfileResponseModel.fromJson(Map<String, dynamic> json) {
    UserProfileDataModel? dataModel;
    if (json['data'] != null) {
      dataModel = UserProfileDataModel.fromJson(json['data']);
    }

    return UserProfileResponseModel(
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

  UserProfileResponseEntity toEntity() {
    return UserProfileResponseEntity(
      success: success,
      message: message,
      data: data?.toEntity(),
      timestamp: timestamp,
    );
  }

  @override
  String toString() {
    return 'UserProfileResponseModel(success: $success, message: $message, data: $data)';
  }
}
