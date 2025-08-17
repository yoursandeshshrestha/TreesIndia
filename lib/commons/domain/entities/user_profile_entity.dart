class UserProfileDataEntity {
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

  const UserProfileDataEntity({
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

  UserProfileDataEntity copyWith({
    String? avatar,
    String? createdAt,
    String? email,
    String? gender,
    int? id,
    bool? isActive,
    bool? isVerified,
    String? name,
    String? phone,
    String? updatedAt,
    String? userType,
  }) {
    return UserProfileDataEntity(
      avatar: avatar ?? this.avatar,
      createdAt: createdAt ?? this.createdAt,
      email: email ?? this.email,
      gender: gender ?? this.gender,
      id: id ?? this.id,
      isActive: isActive ?? this.isActive,
      isVerified: isVerified ?? this.isVerified,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      updatedAt: updatedAt ?? this.updatedAt,
      userType: userType ?? this.userType,
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

  @override
  String toString() {
    return 'UserProfileDataEntity(id: $id, name: $name, email: $email, phone: $phone, isVerified: $isVerified)';
  }
}

class UserProfileResponseEntity {
  final bool success;
  final String message;
  final UserProfileDataEntity? data;
  final String timestamp;

  const UserProfileResponseEntity({
    required this.success,
    required this.message,
    this.data,
    required this.timestamp,
  });

  UserProfileResponseEntity copyWith({
    bool? success,
    String? message,
    UserProfileDataEntity? data,
    String? timestamp,
  }) {
    return UserProfileResponseEntity(
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
    return 'UserProfileResponseEntity(success: $success, message: $message, data: $data)';
  }
}
