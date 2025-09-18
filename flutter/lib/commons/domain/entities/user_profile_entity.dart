class NotificationSettingsEntity {
  final bool bookingReminders;
  final bool emailNotifications;
  final bool marketingEmails;
  final bool pushNotifications;
  final bool serviceUpdates;
  final bool smsNotifications;

  const NotificationSettingsEntity({
    required this.bookingReminders,
    required this.emailNotifications,
    required this.marketingEmails,
    required this.pushNotifications,
    required this.serviceUpdates,
    required this.smsNotifications,
  });

  NotificationSettingsEntity copyWith({
    bool? bookingReminders,
    bool? emailNotifications,
    bool? marketingEmails,
    bool? pushNotifications,
    bool? serviceUpdates,
    bool? smsNotifications,
  }) {
    return NotificationSettingsEntity(
      bookingReminders: bookingReminders ?? this.bookingReminders,
      emailNotifications: emailNotifications ?? this.emailNotifications,
      marketingEmails: marketingEmails ?? this.marketingEmails,
      pushNotifications: pushNotifications ?? this.pushNotifications,
      serviceUpdates: serviceUpdates ?? this.serviceUpdates,
      smsNotifications: smsNotifications ?? this.smsNotifications,
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
}

class RoleApplicationEntity {
  final String? applicationDate;
  final String? approvalDate;
  final String status;

  const RoleApplicationEntity({
    this.applicationDate,
    this.approvalDate,
    required this.status,
  });

  RoleApplicationEntity copyWith({
    String? applicationDate,
    String? approvalDate,
    String? status,
  }) {
    return RoleApplicationEntity(
      applicationDate: applicationDate ?? this.applicationDate,
      approvalDate: approvalDate ?? this.approvalDate,
      status: status ?? this.status,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'application_date': applicationDate,
      'approval_date': approvalDate,
      'status': status,
    };
  }
}

class SubscriptionEntity {
  final String endDate;
  final String startDate;
  final String status;

  const SubscriptionEntity({
    required this.endDate,
    required this.startDate,
    required this.status,
  });

  SubscriptionEntity copyWith({
    String? endDate,
    String? startDate,
    String? status,
  }) {
    return SubscriptionEntity(
      endDate: endDate ?? this.endDate,
      startDate: startDate ?? this.startDate,
      status: status ?? this.status,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'end_date': endDate,
      'start_date': startDate,
      'status': status,
    };
  }
}

class WalletEntity {
  final double balance;

  const WalletEntity({
    required this.balance,
  });

  WalletEntity copyWith({
    double? balance,
  }) {
    return WalletEntity(
      balance: balance ?? this.balance,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'balance': balance,
    };
  }
}

class UserProfileDataEntity {
  final String avatar;
  final String createdAt;
  final String? email;
  final String gender;
  final int id;
  final bool isActive;
  final String? lastLoginAt;
  final String name;
  final NotificationSettingsEntity notificationSettings;
  final String phone;
  final RoleApplicationEntity roleApplication;
  final SubscriptionEntity subscription;
  final String updatedAt;
  final String userType;
  final WalletEntity wallet;

  const UserProfileDataEntity({
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

  UserProfileDataEntity copyWith({
    String? avatar,
    String? createdAt,
    String? email,
    String? gender,
    int? id,
    bool? isActive,
    String? lastLoginAt,
    String? name,
    NotificationSettingsEntity? notificationSettings,
    String? phone,
    RoleApplicationEntity? roleApplication,
    SubscriptionEntity? subscription,
    String? updatedAt,
    String? userType,
    WalletEntity? wallet,
  }) {
    return UserProfileDataEntity(
      avatar: avatar ?? this.avatar,
      createdAt: createdAt ?? this.createdAt,
      email: email ?? this.email,
      gender: gender ?? this.gender,
      id: id ?? this.id,
      isActive: isActive ?? this.isActive,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
      name: name ?? this.name,
      notificationSettings: notificationSettings ?? this.notificationSettings,
      phone: phone ?? this.phone,
      roleApplication: roleApplication ?? this.roleApplication,
      subscription: subscription ?? this.subscription,
      updatedAt: updatedAt ?? this.updatedAt,
      userType: userType ?? this.userType,
      wallet: wallet ?? this.wallet,
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

  @override
  String toString() {
    return 'UserProfileDataEntity(id: $id, name: $name, email: $email, phone: $phone, subscription: ${subscription.status})';
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
