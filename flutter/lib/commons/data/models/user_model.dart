import 'package:trees_india/commons/domain/entities/user_entity.dart';

import 'token_model.dart';

class UserModel {
  final int? userId;
  final String? fullName;
  final String? email;
  final String? userImage;
  final TokenModel? token;
  final String? phone;
  final String? gender;
  final bool? isActive;
  final bool? isVerified;
  final String? userType;
  final String? createdAt;
  final String? updatedAt;

  UserModel({
    this.userId,
    this.fullName,
    this.email,
    this.userImage,
    this.token,
    this.phone,
    this.gender,
    this.isActive,
    this.isVerified,
    this.userType,
    this.createdAt,
    this.updatedAt,
  });

  // Convert the Model to a Map (for local storage or POST requests)
  Map<String, dynamic> toJson() {
    return {
      'fullName': fullName,
      'token': token?.toJson(),
      'userId': userId,
      'email': email,
      'userImage': userImage,
      'phone': phone,
      'gender': gender,
      'isActive': isActive,
      'isVerified': isVerified,
      'userType': userType,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  // Convert the response JSON to a UserModel
  factory UserModel.fromJson(Map<String, dynamic> json) {
    final tokenJson = json['token'];
    TokenModel? tokenModel;

    if (tokenJson != null) {
      tokenModel = TokenModel.fromJson(tokenJson);
    }

    return UserModel(
      fullName: json['fullName'] ?? json['name'],
      userId: json['userId'] ?? json['id'],
      email: json['email'],
      userImage: json['userImage'] ?? json['avatar'],
      token: tokenModel,
      phone: json['phone'],
      gender: json['gender'],
      isActive: json['isActive'] ?? json['is_active'],
      isVerified: json['isVerified'] ?? json['is_verified'],
      userType: json['userType'] ?? json['user_type'],
      createdAt: json['createdAt'] ?? json['created_at'],
      updatedAt: json['updatedAt'] ?? json['updated_at'],
    );
  }

  // Convert UserModel to UserEntity for business logic use
  UserEntity toEntity() {
    return UserEntity(
      userId: userId,
      name: fullName ?? '',
      email: email ?? '',
      token: token?.toEntity(userId: userId.toString()),
      userImage: userImage,
      phone: phone,
      gender: gender,
      isActive: isActive,
      isVerified: isVerified,
      userType: userType,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  UserModel copyWith({
    String? fullName,
    String? email,
    String? userImage,
    TokenModel? token,
    int? userId,
    String? phone,
    String? gender,
    bool? isActive,
    bool? isVerified,
    String? userType,
    String? createdAt,
    String? updatedAt,
  }) {
    return UserModel(
      fullName: fullName ?? this.fullName,
      token: token ?? this.token,
      userId: userId ?? this.userId,
      email: email ?? this.email,
      userImage: userImage ?? this.userImage,
      phone: phone ?? this.phone,
      gender: gender ?? this.gender,
      isActive: isActive ?? this.isActive,
      isVerified: isVerified ?? this.isVerified,
      userType: userType ?? this.userType,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  String toString() {
    return 'UserModel('
        'userId: $userId, '
        'email: $email, '
        'userImage: $userImage, '
        'token: ${token?.toString()}'
        'fullName: $fullName, '
        'token: ${token?.toString()}'
        ')';
  }
}
