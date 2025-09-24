import '../../domain/entities/vendor_entity.dart';

class VendorModel {
  final int id;
  final String createdAt;
  final String updatedAt;
  final String? deletedAt;
  final String vendorName;
  final String businessDescription;
  final String contactPersonName;
  final String contactPersonPhone;
  final String contactPersonEmail;
  final String businessAddress;
  final String businessType;
  final int yearsInBusiness;
  final String profilePicture;
  final bool isActive;
  final int userId;
  final List<String> servicesOffered;
  final List<String> businessGallery;
  final UserModel? user;

  VendorModel({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.vendorName,
    required this.businessDescription,
    required this.contactPersonName,
    required this.contactPersonPhone,
    required this.contactPersonEmail,
    required this.businessAddress,
    required this.businessType,
    required this.yearsInBusiness,
    required this.profilePicture,
    required this.isActive,
    required this.userId,
    required this.servicesOffered,
    required this.businessGallery,
    this.user,
  });

  factory VendorModel.fromJson(Map<String, dynamic> json) {
    return VendorModel(
      id: json['ID'] ?? 0,
      createdAt: json['CreatedAt'] ?? '',
      updatedAt: json['UpdatedAt'] ?? '',
      deletedAt: json['DeletedAt'],
      vendorName: json['vendor_name'] ?? '',
      businessDescription: json['business_description'] ?? '',
      contactPersonName: json['contact_person_name'] ?? '',
      contactPersonPhone: json['contact_person_phone'] ?? '',
      contactPersonEmail: json['contact_person_email'] ?? '',
      businessAddress: json['business_address'] ?? '',
      businessType: json['business_type'] ?? '',
      yearsInBusiness: json['years_in_business'] ?? 0,
      profilePicture: json['profile_picture'] ?? '',
      isActive: json['is_active'] ?? false,
      userId: json['user_id'] ?? 0,
      servicesOffered: List<String>.from(json['services_offered'] ?? []),
      businessGallery: List<String>.from(json['business_gallery'] ?? []),
      user: json['user'] != null ? UserModel.fromJson(json['user']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ID': id,
      'CreatedAt': createdAt,
      'UpdatedAt': updatedAt,
      'DeletedAt': deletedAt,
      'vendor_name': vendorName,
      'business_description': businessDescription,
      'contact_person_name': contactPersonName,
      'contact_person_phone': contactPersonPhone,
      'contact_person_email': contactPersonEmail,
      'business_address': businessAddress,
      'business_type': businessType,
      'years_in_business': yearsInBusiness,
      'profile_picture': profilePicture,
      'is_active': isActive,
      'user_id': userId,
      'services_offered': servicesOffered,
      'business_gallery': businessGallery,
      'user': user?.toJson(),
    };
  }

  VendorEntity toEntity() {
    return VendorEntity(
      id: id,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deletedAt: deletedAt,
      vendorName: vendorName,
      businessDescription: businessDescription,
      contactPersonName: contactPersonName,
      contactPersonPhone: contactPersonPhone,
      contactPersonEmail: contactPersonEmail,
      businessAddress: businessAddress,
      businessType: businessType,
      yearsInBusiness: yearsInBusiness,
      profilePicture: profilePicture,
      isActive: isActive,
      userId: userId,
      servicesOffered: servicesOffered,
      businessGallery: businessGallery,
      user: user?.toEntity(),
    );
  }
}

class UserModel {
  final int id;
  final String createdAt;
  final String updatedAt;
  final String? deletedAt;
  final String name;
  final String? email;
  final String phone;
  final String userType;
  final String avatar;
  final String gender;
  final bool isActive;
  final String lastLoginAt;
  final String roleApplicationStatus;
  final String? applicationDate;
  final String? approvalDate;
  final double walletBalance;
  final int? subscriptionId;
  final dynamic subscription;
  final bool hasActiveSubscription;
  final String subscriptionExpiryDate;
  final dynamic notificationSettings;

  UserModel({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.name,
    this.email,
    required this.phone,
    required this.userType,
    required this.avatar,
    required this.gender,
    required this.isActive,
    required this.lastLoginAt,
    required this.roleApplicationStatus,
    this.applicationDate,
    this.approvalDate,
    required this.walletBalance,
    this.subscriptionId,
    this.subscription,
    required this.hasActiveSubscription,
    required this.subscriptionExpiryDate,
    this.notificationSettings,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['ID'] ?? 0,
      createdAt: json['CreatedAt'] ?? '',
      updatedAt: json['UpdatedAt'] ?? '',
      deletedAt: json['DeletedAt'],
      name: json['name'] ?? '',
      email: json['email'],
      phone: json['phone'] ?? '',
      userType: json['user_type'] ?? '',
      avatar: json['avatar'] ?? '',
      gender: json['gender'] ?? '',
      isActive: json['is_active'] ?? false,
      lastLoginAt: json['last_login_at'] ?? '',
      roleApplicationStatus: json['role_application_status'] ?? '',
      applicationDate: json['application_date'],
      approvalDate: json['approval_date'],
      walletBalance: (json['wallet_balance'] ?? 0).toDouble(),
      subscriptionId: json['subscription_id'],
      subscription: json['subscription'],
      hasActiveSubscription: json['has_active_subscription'] ?? false,
      subscriptionExpiryDate: json['subscription_expiry_date'] ?? '',
      notificationSettings: json['notification_settings'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ID': id,
      'CreatedAt': createdAt,
      'UpdatedAt': updatedAt,
      'DeletedAt': deletedAt,
      'name': name,
      'email': email,
      'phone': phone,
      'user_type': userType,
      'avatar': avatar,
      'gender': gender,
      'is_active': isActive,
      'last_login_at': lastLoginAt,
      'role_application_status': roleApplicationStatus,
      'application_date': applicationDate,
      'approval_date': approvalDate,
      'wallet_balance': walletBalance,
      'subscription_id': subscriptionId,
      'subscription': subscription,
      'has_active_subscription': hasActiveSubscription,
      'subscription_expiry_date': subscriptionExpiryDate,
      'notification_settings': notificationSettings,
    };
  }

  UserEntity toEntity() {
    return UserEntity(
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