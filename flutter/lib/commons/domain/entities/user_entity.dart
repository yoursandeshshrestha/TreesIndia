import 'package:trees_india/commons/domain/entities/token_entity.dart';

class UserEntity {
  final int? userId;
  final String? name;
  final String? email;
  final String? userImage;
  final TokenEntity? token;
  final String? phone;
  final String? gender;
  final bool? isActive;
  final String? userType;
  final String? createdAt;
  final String? updatedAt;

  const UserEntity({
    this.userId,
    this.name = '',
    this.email = '',
    this.userImage,
    this.token,
    this.phone,
    this.gender,
    this.isActive,
    this.userType,
    this.createdAt,
    this.updatedAt,
  });

  UserEntity copyWith({
    int? userId,
    String? name,
    String? email,
    String? userImage,
    TokenEntity? token,
    String? phone,
    String? gender,
    bool? isActive,
    String? userType,
    String? createdAt,
    String? updatedAt,
  }) {
    return UserEntity(
      userId: userId ?? this.userId,
      name: name ?? this.name,
      email: email ?? this.email,
      userImage: userImage ?? this.userImage,
      token: token ?? this.token,
      phone: phone ?? this.phone,
      gender: gender ?? this.gender,
      isActive: isActive ?? this.isActive,
      userType: userType ?? this.userType,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  String toString() {
    return 'UserEntity(userId: $userId, name: $name, email: $email, )';
  }

  // Serialization method
  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'name': name,
      'email': email,
      'userImage': userImage,
      'token': token?.toJson(),
      'phone': phone,
      'gender': gender,
      'isActive': isActive,
      'userType': userType,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}
