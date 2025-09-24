import '../../domain/entities/project_entity.dart';

class ProjectModel {
  final int id;
  final String createdAt;
  final String updatedAt;
  final String? deletedAt;
  final String title;
  final String description;
  final String slug;
  final String projectType;
  final String status;
  final String state;
  final String city;
  final String address;
  final String pincode;
  final int estimatedDurationDays;
  final ContactInfoModel contactInfo;
  final bool uploadedByAdmin;
  final List<String> images;
  final int userId;
  final UserModel user;

  const ProjectModel({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    required this.title,
    required this.description,
    required this.slug,
    required this.projectType,
    required this.status,
    required this.state,
    required this.city,
    required this.address,
    required this.pincode,
    required this.estimatedDurationDays,
    required this.contactInfo,
    required this.uploadedByAdmin,
    required this.images,
    required this.userId,
    required this.user,
  });

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    return ProjectModel(
      id: json['ID'] ?? 0,
      createdAt: json['CreatedAt'] ?? '',
      updatedAt: json['UpdatedAt'] ?? '',
      deletedAt: json['DeletedAt'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      slug: json['slug'] ?? '',
      projectType: json['project_type'] ?? '',
      status: json['status'] ?? '',
      state: json['state'] ?? '',
      city: json['city'] ?? '',
      address: json['address'] ?? '',
      pincode: json['pincode'] ?? '',
      estimatedDurationDays: json['estimated_duration_days'] ?? 0,
      contactInfo: ContactInfoModel.fromJson(json['contact_info'] ?? {}),
      uploadedByAdmin: json['uploaded_by_admin'] ?? false,
      images: List<String>.from(json['images'] ?? []),
      userId: json['user_id'] ?? 0,
      user: UserModel.fromJson(json['user'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ID': id,
      'CreatedAt': createdAt,
      'UpdatedAt': updatedAt,
      'DeletedAt': deletedAt,
      'title': title,
      'description': description,
      'slug': slug,
      'project_type': projectType,
      'status': status,
      'state': state,
      'city': city,
      'address': address,
      'pincode': pincode,
      'estimated_duration_days': estimatedDurationDays,
      'contact_info': contactInfo.toJson(),
      'uploaded_by_admin': uploadedByAdmin,
      'images': images,
      'user_id': userId,
      'user': user.toJson(),
    };
  }

  ProjectEntity toEntity() {
    return ProjectEntity(
      id: id,
      title: title,
      description: description,
      slug: slug,
      projectType: projectType,
      status: status,
      state: state,
      city: city,
      address: address,
      pincode: pincode,
      estimatedDurationDays: estimatedDurationDays,
      contactPersonName: contactInfo.contactPerson,
      contactPersonPhone: contactInfo.phone,
      contactPersonEmail: contactInfo.email,
      alternativeContact: contactInfo.alternativeContact,
      uploadedByAdmin: uploadedByAdmin,
      images: images,
      userId: userId,
      userDisplayName: user.name,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  @override
  String toString() {
    return 'ProjectModel(id: $id, title: $title, projectType: $projectType, status: $status)';
  }
}

class ContactInfoModel {
  final String alternativeContact;
  final String contactPerson;
  final String email;
  final String phone;

  const ContactInfoModel({
    required this.alternativeContact,
    required this.contactPerson,
    required this.email,
    required this.phone,
  });

  factory ContactInfoModel.fromJson(Map<String, dynamic> json) {
    return ContactInfoModel(
      alternativeContact: json['alternative_contact'] ?? '',
      contactPerson: json['contact_person'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'alternative_contact': alternativeContact,
      'contact_person': contactPerson,
      'email': email,
      'phone': phone,
    };
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
  final String? subscriptionExpiryDate;
  final dynamic notificationSettings;

  const UserModel({
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
    this.subscriptionExpiryDate,
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
      subscriptionExpiryDate: json['subscription_expiry_date'],
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
}