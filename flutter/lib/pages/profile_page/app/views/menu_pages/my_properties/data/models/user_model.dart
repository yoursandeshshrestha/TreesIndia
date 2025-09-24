import '../../domain/entities/user_entity.dart';

class PropertyUserModel {
  final int id;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? deletedAt;
  final String name;
  final String? email;
  final String? phone;
  final String userType;
  final String? avatar;
  final String? gender;
  final bool isActive;
  final DateTime? lastLoginAt;
  final String roleApplicationStatus;
  final DateTime? applicationDate;
  final DateTime? approvalDate;
  final double walletBalance;
  final int? subscriptionId;
  final dynamic subscription;
  final bool hasActiveSubscription;
  final DateTime? subscriptionExpiryDate;
  final dynamic notificationSettings;

  PropertyUserModel({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.name,
    this.email,
    this.phone,
    required this.userType,
    this.avatar,
    this.gender,
    required this.isActive,
    this.lastLoginAt,
    required this.roleApplicationStatus,
    this.applicationDate,
    this.approvalDate,
    required this.walletBalance,
    this.subscriptionId,
    this.subscription,
    required this.hasActiveSubscription,
    this.subscriptionExpiryDate,
    this.notificationSettings,
  });

  factory PropertyUserModel.fromJson(Map<String, dynamic> json) {
    return PropertyUserModel(
      id: json['ID'] ?? json['id'],
      createdAt: DateTime.parse(json['CreatedAt'] ?? json['created_at']),
      updatedAt: DateTime.parse(json['UpdatedAt'] ?? json['updated_at']),
      deletedAt: json['DeletedAt'] != null
          ? DateTime.parse(json['DeletedAt'])
          : json['deleted_at'] != null
              ? DateTime.parse(json['deleted_at'])
              : null,
      name: json['name'] ?? '',
      email: json['email'],
      phone: json['phone'],
      userType: json['user_type'] ?? '',
      avatar: json['avatar'],
      gender: json['gender'],
      isActive: json['is_active'] ?? false,
      lastLoginAt: json['last_login_at'] != null
          ? DateTime.parse(json['last_login_at'])
          : null,
      roleApplicationStatus: json['role_application_status'] ?? 'none',
      applicationDate: json['application_date'] != null
          ? DateTime.parse(json['application_date'])
          : null,
      approvalDate: json['approval_date'] != null
          ? DateTime.parse(json['approval_date'])
          : null,
      walletBalance: (json['wallet_balance'] ?? 0).toDouble(),
      subscriptionId: json['subscription_id'],
      subscription: json['subscription'],
      hasActiveSubscription: json['has_active_subscription'] ?? false,
      subscriptionExpiryDate: json['subscription_expiry_date'] != null
          ? DateTime.parse(json['subscription_expiry_date'])
          : null,
      notificationSettings: json['notification_settings'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'deleted_at': deletedAt?.toIso8601String(),
      'name': name,
      'email': email,
      'phone': phone,
      'user_type': userType,
      'avatar': avatar,
      'gender': gender,
      'is_active': isActive,
      'last_login_at': lastLoginAt?.toIso8601String(),
      'role_application_status': roleApplicationStatus,
      'application_date': applicationDate?.toIso8601String(),
      'approval_date': approvalDate?.toIso8601String(),
      'wallet_balance': walletBalance,
      'subscription_id': subscriptionId,
      'subscription': subscription,
      'has_active_subscription': hasActiveSubscription,
      'subscription_expiry_date': subscriptionExpiryDate?.toIso8601String(),
      'notification_settings': notificationSettings,
    };
  }

  PropertyUserEntity toEntity() {
    return PropertyUserEntity(
      id: id,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deletedAt: deletedAt,
      name: name,
      email: email,
      phone: phone,
      userType: userType,
      avatar: avatar,
      gender: gender,
      isActive: isActive,
      lastLoginAt: lastLoginAt,
      roleApplicationStatus: roleApplicationStatus,
      applicationDate: applicationDate,
      approvalDate: approvalDate,
      walletBalance: walletBalance,
      subscriptionId: subscriptionId,
      subscription: subscription,
      hasActiveSubscription: hasActiveSubscription,
      subscriptionExpiryDate: subscriptionExpiryDate,
      notificationSettings: notificationSettings,
    );
  }
}
