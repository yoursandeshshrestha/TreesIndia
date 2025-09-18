import '../../domain/entities/user_profile_entity.dart';

class NotificationSettingsModel {
  final bool bookingReminders;
  final bool emailNotifications;
  final bool marketingEmails;
  final bool pushNotifications;
  final bool serviceUpdates;
  final bool smsNotifications;

  NotificationSettingsModel({
    required this.bookingReminders,
    required this.emailNotifications,
    required this.marketingEmails,
    required this.pushNotifications,
    required this.serviceUpdates,
    required this.smsNotifications,
  });

  factory NotificationSettingsModel.fromJson(Map<String, dynamic> json) {
    return NotificationSettingsModel(
      bookingReminders: json['booking_reminders'] ?? false,
      emailNotifications: json['email_notifications'] ?? false,
      marketingEmails: json['marketing_emails'] ?? false,
      pushNotifications: json['push_notifications'] ?? false,
      serviceUpdates: json['service_updates'] ?? false,
      smsNotifications: json['sms_notifications'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'booking_reminders': bookingReminders,
      'email_notifications': emailNotifications,
      'marketing_emails': marketingEmails,
      'push_notifications': pushNotifications,
      'service_updates': serviceUpdates,
      'sms_notifications': smsNotifications,
    };
  }

  NotificationSettingsEntity toEntity() {
    return NotificationSettingsEntity(
      bookingReminders: bookingReminders,
      emailNotifications: emailNotifications,
      marketingEmails: marketingEmails,
      pushNotifications: pushNotifications,
      serviceUpdates: serviceUpdates,
      smsNotifications: smsNotifications,
    );
  }
}

class RoleApplicationModel {
  final String? applicationDate;
  final String? approvalDate;
  final String status;

  RoleApplicationModel({
    this.applicationDate,
    this.approvalDate,
    required this.status,
  });

  factory RoleApplicationModel.fromJson(Map<String, dynamic> json) {
    return RoleApplicationModel(
      applicationDate: json['application_date'],
      approvalDate: json['approval_date'],
      status: json['status'] ?? 'none',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'application_date': applicationDate,
      'approval_date': approvalDate,
      'status': status,
    };
  }

  RoleApplicationEntity toEntity() {
    return RoleApplicationEntity(
      applicationDate: applicationDate,
      approvalDate: approvalDate,
      status: status,
    );
  }
}

class SubscriptionModel {
  final String endDate;
  final String startDate;
  final String status;

  SubscriptionModel({
    required this.endDate,
    required this.startDate,
    required this.status,
  });

  factory SubscriptionModel.fromJson(Map<String, dynamic> json) {
    return SubscriptionModel(
      endDate: json['end_date'] ?? '',
      startDate: json['start_date'] ?? '',
      status: json['status'] ?? 'inactive',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'end_date': endDate,
      'start_date': startDate,
      'status': status,
    };
  }

  SubscriptionEntity toEntity() {
    return SubscriptionEntity(
      endDate: endDate,
      startDate: startDate,
      status: status,
    );
  }
}

class WalletModel {
  final double balance;

  WalletModel({
    required this.balance,
  });

  factory WalletModel.fromJson(Map<String, dynamic> json) {
    return WalletModel(
      balance: (json['balance'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'balance': balance,
    };
  }

  WalletEntity toEntity() {
    return WalletEntity(
      balance: balance,
    );
  }
}

class UserProfileDataModel {
  final String avatar;
  final String createdAt;
  final String? email;
  final String gender;
  final int id;
  final bool isActive;
  final String? lastLoginAt;
  final String name;
  final NotificationSettingsModel notificationSettings;
  final String phone;
  final RoleApplicationModel roleApplication;
  final SubscriptionModel subscription;
  final String updatedAt;
  final String userType;
  final WalletModel wallet;

  UserProfileDataModel({
    required this.avatar,
    required this.createdAt,
    this.email,
    required this.gender,
    required this.id,
    required this.isActive,
    this.lastLoginAt,
    required this.name,
    required this.notificationSettings,
    required this.phone,
    required this.roleApplication,
    required this.subscription,
    required this.updatedAt,
    required this.userType,
    required this.wallet,
  });

  factory UserProfileDataModel.fromJson(Map<String, dynamic> json) {
    return UserProfileDataModel(
      avatar: json['avatar'] ?? '',
      createdAt: json['created_at'] ?? '',
      email: json['email'],
      gender: json['gender'] ?? '',
      id: json['id'] ?? 0,
      isActive: json['is_active'] ?? false,
      lastLoginAt: json['last_login_at'],
      name: json['name'] ?? '',
      notificationSettings: NotificationSettingsModel.fromJson(json['notification_settings'] ?? {}),
      phone: json['phone'] ?? '',
      roleApplication: RoleApplicationModel.fromJson(json['role_application'] ?? {}),
      subscription: SubscriptionModel.fromJson(json['subscription'] ?? {}),
      updatedAt: json['updated_at'] ?? '',
      userType: json['user_type'] ?? '',
      wallet: WalletModel.fromJson(json['wallet'] ?? {}),
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
      'last_login_at': lastLoginAt,
      'name': name,
      'notification_settings': notificationSettings.toJson(),
      'phone': phone,
      'role_application': roleApplication.toJson(),
      'subscription': subscription.toJson(),
      'updated_at': updatedAt,
      'user_type': userType,
      'wallet': wallet.toJson(),
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
      lastLoginAt: lastLoginAt,
      name: name,
      notificationSettings: notificationSettings.toEntity(),
      phone: phone,
      roleApplication: roleApplication.toEntity(),
      subscription: subscription.toEntity(),
      updatedAt: updatedAt,
      userType: userType,
      wallet: wallet.toEntity(),
    );
  }

  @override
  String toString() {
    return 'UserProfileDataModel(id: $id, name: $name, email: $email, phone: $phone, subscription: ${subscription.status})';
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
